import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import api from '../../services/api';
import type { AnalysisSummary } from '../../types';
import styles from './History.module.css';

interface Props {
  user: any;
  onLogout: () => void;
}

const FILE_ICONS: Record<string, string> = {
  'text/csv': '📊',
  'application/vnd.ms-excel': '📗',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗',
  'application/pdf': '📕',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
};

const FILE_LABELS: Record<string, string> = {
  'text/csv': 'CSV',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const History = ({ user, onLogout }: Props) => {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get<AnalysisSummary[]>('/analysis/my');
        setAnalyses(data);
      } catch {
        setError('Could not load your analyses.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const total = analyses.length;
  const complete = analyses.filter(a => a.status === 'complete').length;
 // const failed = analyses.filter(a => a.status === 'failed').length;

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar user={user} onLogout={onLogout} isAuthenticated={true} />
        <div className={styles.centered}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading your analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar user={user} onLogout={onLogout} isAuthenticated={true} />
      <main className={styles.main}>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Analysis history</h1>
            <p className={styles.subtitle}>
              All your past uploads and their results
            </p>
          </div>
          <Link to="/upload" className={styles.newBtn}>
            + New analysis
          </Link>
        </div>

        {/* STATS */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{total}</div>
            <div className={styles.statLabel}>Total analyses</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.accent}`}>{complete}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.brand}`}>
              {5 - total < 0 ? 0 : 5 - total}
            </div>
            <div className={styles.statLabel}>Free analyses remaining</div>
          </div>
        </div>

        {/* LIST */}
        {error ? (
          <div className={styles.tableCard}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⚠</div>
              <h3 className={styles.emptyTitle}>Something went wrong</h3>
              <p className={styles.emptyText}>{error}</p>
            </div>
          </div>
        ) : analyses.length === 0 ? (
          <div className={styles.tableCard}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📂</div>
              <h3 className={styles.emptyTitle}>No analyses yet</h3>
              <p className={styles.emptyText}>
                Upload your first CSV, Excel, PDF or Word file and AvelarAI
                will analyze it instantly.
              </p>
              <Link to="/upload" className={styles.emptyBtn}>
                Upload your first file
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Recent analyses</h2>
              <span className={styles.tableCount}>{total} total</span>
            </div>
            <div className={styles.list}>
              {analyses.map((analysis) => (
                <Link
                  key={analysis._id}
                  to={`/dashboard/${analysis._id}`}
                  className={styles.listItem}
                >
                  <div className={styles.fileIcon}>
                    {FILE_ICONS[analysis.fileType] || '📄'}
                  </div>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{analysis.fileName}</div>
                    <div className={styles.fileMeta}>
                      {FILE_LABELS[analysis.fileType] || 'File'} · {formatDate(analysis.createdAt)}
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${
                    analysis.status === 'complete' ? styles.statusComplete :
                    analysis.status === 'failed' ? styles.statusFailed :
                    styles.statusProcessing
                  }`}>
                    {analysis.status === 'complete' ? '✓ Complete' :
                     analysis.status === 'failed' ? '✗ Failed' :
                     '⟳ Processing'}
                  </span>
                  <span className={styles.arrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default History;