import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
//import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import styles from './Upload.module.css';

const ACCEPTED_TYPES: Record<string, string> = {
  'text/csv': 'CSV',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
};

const FILE_ICONS: Record<string, string> = {
  CSV: '📊',
  Excel: '📗',
  PDF: '📕',
  Word: '📘',
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const PROCESSING_STEPS = [
  'Reading your file',
  'Extracting data',
  'Running AI analysis',
  'Generating insights',
  'Preparing your report',
];

const Upload = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const navigate = useNavigate();
  
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(-1);

  const validateFile = (f: File): string => {
    if (!ACCEPTED_TYPES[f.type]) {
      return 'Unsupported file type. Please upload a CSV, Excel, PDF or Word file.';
    }
    if (f.size > 10 * 1024 * 1024) {
      return 'File is too large. Maximum size is 10MB.';
    }
    return '';
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  // Animate processing steps while waiting
  useEffect(() => {
    if (!loading) { setProcessingStep(-1); return; }
    let step = 0;
    setProcessingStep(0);
    const interval = setInterval(() => {
      step++;
      if (step < PROCESSING_STEPS.length - 1) {
        setProcessingStep(step);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post<{ analysisId: string }>(
        '/analysis/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Poll until analysis is complete
      const analysisId = data.analysisId;
      const poll = setInterval(async () => {
        try {
          const { data: analysis } = await api.get(`/analysis/${analysisId}`);
          if (analysis.status === 'complete') {
            clearInterval(poll);
            navigate(`/dashboard/${analysisId}`);
          } else if (analysis.status === 'failed') {
            clearInterval(poll);
            setError('Analysis failed. Please try again with a different file.');
            setLoading(false);
          }
        } catch {
          clearInterval(poll);
          setError('Something went wrong. Please try again.');
          setLoading(false);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setLoading(false);
    }
  };

  const fileType = file ? ACCEPTED_TYPES[file.type] : null;
  const remainingUploads = 5 - (user as any)?.uploadsUsed || 5;

  return (
    <div className={styles.page}>
    <Navbar user={user} onLogout={onLogout} isAuthenticated={true} />
      <main className={styles.main}>

        <div className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Ready to analyze
          </div>
          <h1 className={styles.title}>Upload your data</h1>
          <p className={styles.subtitle}>
            Drop any CSV, Excel, PDF or Word file and let AvelarAI do the rest.
            Results in seconds.
          </p>
        </div>

        <div className={styles.card}>
          {loading ? (
            <div className={styles.processing}>
              <div className={styles.processingRing} />
              <h3 className={styles.processingTitle}>Analyzing your data...</h3>
              <p style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 300 }}>
                This usually takes 10–30 seconds
              </p>
              <div className={styles.processingSteps}>
                {PROCESSING_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`${styles.processingStep} ${
                      i === processingStep
                        ? styles.active
                        : i < processingStep
                        ? styles.done
                        : ''
                    }`}
                  >
                    <div className={styles.stepDot} />
                    {i < processingStep ? `✓ ${step}` : step}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div
                className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''} ${file ? styles.dropZoneHasFile : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !file && inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className={styles.hiddenInput}
                  accept=".csv,.xlsx,.xls,.pdf,.docx"
                  onChange={onInputChange}
                  style={{ display: 'none' }}
                />

                {file ? (
                  <div className={styles.filePreview}>
                    <div className={styles.fileIconWrap}>
                      {FILE_ICONS[fileType!]}
                    </div>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>{file.name}</div>
                      <div className={styles.fileMeta}>
                        {fileType} · {formatBytes(file.size)}
                      </div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setError('');
                        if (inputRef.current) inputRef.current.value = '';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>
                      <svg viewBox="0 0 24 24">
                        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M8 8l4-4 4 4" />
                      </svg>
                    </div>
                    <h3 className={styles.dropTitle}>
                      {dragging ? 'Drop it here' : 'Drop your file here'}
                    </h3>
                    <p className={styles.dropSubtitle}>
                      or <strong>click to browse</strong> from your computer
                    </p>
                    <div className={styles.filePills}>
                      {['CSV', 'Excel', 'PDF', 'Word'].map((t) => (
                        <span key={t} className={styles.filePill}>{t}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className={styles.limitInfo}>
                <span className={styles.limitText}>
                  <strong>{remainingUploads}</strong> free analyses remaining this month
                </span>
                <span className={`${styles.limitBadge} ${styles.limitBadgeFree}`}>
                  FREE TIER
                </span>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              <button
                className={styles.submitBtn}
                disabled={!file}
                onClick={handleSubmit}
              >
                Analyze with AI
              </button>
            </>
          )}
        </div>

        <div className={styles.historyLink}>
          <Link to="/history">View previous analyses →</Link>
        </div>

      </main>
    </div>
  );
};

export default Upload;