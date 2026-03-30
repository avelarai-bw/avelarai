import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Navbar from '../../components/Navbar/Navbar';
import api from '../../services/api';
import type { Analysis } from '../../types';
import styles from './Dashboard.module.css';

interface Props {
  user: any;
  onLogout: () => void;
}

const CHART_COLORS = ['#0D6EFD', '#00C9B1', '#8b61b5', '#f59e0b', '#ef4444', '#22c55e'];

const fmt = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  return Number.isInteger(val) ? val.toString() : val.toFixed(2);
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const Dashboard = ({ user, onLogout }: Props) => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get<Analysis>(`/analysis/${id}`);
        if (cancelled) return;

        if (data.status === 'processing') {
          setTimeout(fetchAnalysis, 2000);
          return;
        }

        setAnalysis(data);
      } catch {
        if (!cancelled) setError('Could not load this analysis.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalysis();
    return () => { cancelled = true; };
  }, [id]);

  const handleExport = async (type: 'pdf' | 'word') => {
    if (!id) return;
    setExporting(type);
    try {
      const { data } = await api.get(`/analysis/${id}/export/${type}`, {
        responseType: 'blob'
      });
      const ext = type === 'pdf' ? 'pdf' : 'docx';
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis?.fileName?.replace(/\.[^.]+$/, '') || 'report'}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

 const renderChart = () => {
    if (!analysis?.chartData?.chartSuggestions?.length) return null;
    const suggestion = analysis.chartData.chartSuggestions[0];
    const { type, xKey, yKey } = suggestion;

    let chartData: any[] = [];
    try {
      const lines = analysis.rawData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((h, i) => {
          const num = parseFloat(vals[i]);
          obj[h] = isNaN(num) ? vals[i] : num;
        });
        return obj;
      });

      // Check if yKey is numeric across rows
      const yIsNumeric = rows.every(r => typeof r[yKey] === 'number');

      if (yIsNumeric) {
        // Use rows directly, limit to 12
        chartData = rows.slice(0, 12);
      } else {
        // yKey is categorical — count occurrences of xKey groups
        const counts: Record<string, number> = {};
        rows.forEach(r => {
          const key = String(r[xKey] || 'Unknown');
          counts[key] = (counts[key] || 0) + 1;
        });
        chartData = Object.entries(counts).map(([name, count]) => ({
          [xKey]: name,
          count,
        }));
        // Use count as the actual yKey
      }
    } catch {
      return null;
    }

    if (!chartData.length) return null;

    // If we fell back to count-based data, use 'count' as yKey
    const actualYKey = chartData[0]?.[yKey] !== undefined ? yKey : 'count';

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={xKey} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }}
              labelStyle={{ color: 'var(--text)' }}
              itemStyle={{ color: 'var(--text2)' }}
            />
            <Line type="monotone" dataKey={actualYKey} stroke="#0D6EFD" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey={actualYKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text)' }}
            itemStyle={{ color: 'var(--text2)' }}
          />
          <Bar dataKey={actualYKey} fill="#0D6EFD" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const insightColors = ['var(--accent)', 'var(--brand)', '#f59e0b', '#8b61b5', '#ef4444'];

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar user={user} onLogout={onLogout} isAuthenticated={true} />
        <div className={styles.centered}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className={styles.page}>
        <Navbar user={user} onLogout={onLogout} isAuthenticated={true} />
        <div className={styles.centered}>
          <p className={styles.errorText}>{error || 'Analysis not found.'}</p>
          <Link to="/upload" style={{ color: 'var(--brand)', fontSize: '14px' }}>
            ← Upload a new file
          </Link>
        </div>
      </div>
    );
  }

  const stats = analysis.statistics;
  const numericCols = stats?.columns?.filter(c => c.type === 'numeric') ?? [];

  return (
    <div className={styles.page}>
      <Navbar user={user} onLogout={onLogout} isAuthenticated={true} />
      <main className={styles.main}>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to="/history" className={styles.backLink}>← Back to history</Link>
            <h1 className={styles.fileName}>{analysis.fileName}</h1>
            <div className={styles.fileMeta}>
              <span className={styles.metaItem}>{formatDate(analysis.createdAt)}</span>
              {stats && (
                <>
                  <span className={styles.metaItem}>·</span>
                  <span className={styles.metaItem}>
                    {stats.rowCount.toLocaleString()} rows
                  </span>
                  <span className={styles.metaItem}>·</span>
                  <span className={styles.metaItem}>{stats.columnCount} columns</span>
                </>
              )}
              <span
                className={`${styles.statusBadge} ${
                  analysis.status === 'complete' ? styles.statusComplete :
                  analysis.status === 'failed' ? styles.statusFailed :
                  styles.statusProcessing
                }`}
              >
                {analysis.status === 'complete' ? '✓ Complete' :
                 analysis.status === 'failed' ? '✗ Failed' : '⟳ Processing'}
              </span>
            </div>
          </div>
          <div className={styles.exportBtns}>
            <button
              className={styles.btnOutline}
              onClick={() => handleExport('word')}
              disabled={!!exporting}
            >
              {exporting === 'word' ? 'Exporting...' : '↓ Word'}
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => handleExport('pdf')}
              disabled={!!exporting}
            >
              {exporting === 'pdf' ? 'Exporting...' : '↓ PDF'}
            </button>
          </div>
        </div>

        {/* METRICS */}
        {stats && (
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <div className={styles.metricVal}>
                {stats.rowCount.toLocaleString()}
              </div>
              <div className={styles.metricLabel}>Total rows</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricVal}>{stats.columnCount}</div>
              <div className={styles.metricLabel}>Columns detected</div>
              <div className={styles.metricSub}>{numericCols.length} numeric</div>
            </div>
            {numericCols[0] && (
              <div className={styles.metricCard}>
                <div className={`${styles.metricVal} ${styles.accent}`}>
                  {fmt(numericCols[0].mean)}
                </div>
                <div className={styles.metricLabel}>Mean — {numericCols[0].name}</div>
                <div className={styles.metricSub}>σ = {fmt(numericCols[0].stdDev)}</div>
              </div>
            )}
            {numericCols[0] && (
              <div className={styles.metricCard}>
                <div className={`${styles.metricVal} ${styles.brand}`}>
                  {fmt(numericCols[0].variance)}
                </div>
                <div className={styles.metricLabel}>
                  Variance — {numericCols[0].name}
                </div>
                <div className={styles.metricSub}>
                  Median: {fmt(numericCols[0].median)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUMMARY + INSIGHTS */}
        <div className={styles.twoCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>AI summary</h2>
              <span className={styles.cardLabel}>Overview</span>
            </div>
            <p className={styles.summaryText}>
              {analysis.chartData?.summary || 'No summary available.'}
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Key insights</h2>
              <span className={styles.cardLabel}>
                {analysis.chartData?.keyInsights?.length ?? 0} found
              </span>
            </div>
            <div className={styles.insightsList}>
              {analysis.chartData?.keyInsights?.map((insight, i) => (
                <div key={i} className={styles.insightItem}>
                  <div
                    className={styles.insightDot}
                    style={{ background: insightColors[i % insightColors.length] }}
                  />
                  <p className={styles.insightText}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART + INTERPRETATION */}
        <div className={styles.twoCol}>
          {analysis.chartData?.chartSuggestions?.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  {analysis.chartData.chartSuggestions[0].title}
                </h2>
                <span className={styles.cardLabel}>
                  {analysis.chartData.chartSuggestions[0].type} chart
                </span>
              </div>
              <div className={styles.chartWrap}>
                {renderChart()}
              </div>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>AI interpretation</h2>
              <span className={styles.cardLabel}>Analysis</span>
            </div>
            <p className={styles.interpretationText}>
              {analysis.interpretation || 'No interpretation available.'}
            </p>
          </div>
        </div>

        {/* STATS TABLE */}
        {stats && stats.columns && stats.columns.length > 0 && (
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Column statistics</h2>
              <span className={styles.cardLabel}>
                {stats.columns.length} columns
              </span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.statsTable}>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Mean</th>
                    <th>Median</th>
                    <th>Mode</th>
                    <th>Std dev</th>
                    <th>Variance</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Nulls</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.columns.map((col) => (
                    <tr key={col.name}>
                      <td className={styles.colName}>{col.name}</td>
                      <td>
                        <span className={`${styles.typePill} ${
                          col.type === 'numeric' ? styles.typeNumeric :
                          col.type === 'date' ? styles.typeDate :
                          styles.typeCategorical
                        }`}>
                          {col.type}
                        </span>
                      </td>
                      <td>{fmt(col.mean)}</td>
                      <td>{fmt(col.median)}</td>
                      <td>{col.mode !== null ? String(col.mode) : '—'}</td>
                      <td>{fmt(col.stdDev)}</td>
                      <td>{fmt(col.variance)}</td>
                      <td>{fmt(col.min)}</td>
                      <td>{fmt(col.max)}</td>
                      <td className={col.nullCount > 0 ? '' : styles.nullVal}>
                        {col.nullCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;