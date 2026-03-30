import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Landing.module.css';

const features = [
  {
    icon: '📊',
    bg: 'rgba(13,110,253,0.1)',
    title: 'Statistical analysis',
    desc: 'Mean, median, mode, standard deviation and variance computed automatically across every numeric column in your dataset.',
  },
  {
    icon: '🧠',
    bg: 'rgba(0,201,177,0.1)',
    title: 'AI interpretation',
    desc: 'Our reasoning model reads your data and writes plain-English explanations of patterns, outliers and trends anyone can understand.',
  },
  {
    icon: '📈',
    bg: 'rgba(139,97,181,0.1)',
    title: 'Auto-generated charts',
    desc: 'Bar, line and pie charts generated automatically based on what your data is best suited for. No configuration needed.',
  },
  {
    icon: '📄',
    bg: 'rgba(34,197,94,0.1)',
    title: 'Export reports',
    desc: 'Download a complete analysis report as a polished PDF or Word document — ready to share with clients or your team.',
  },
  {
    icon: '🔒',
    bg: 'rgba(251,146,60,0.1)',
    title: 'Secure & private',
    desc: 'Your files are processed and immediately deleted. No data is stored beyond your analysis. Your privacy is guaranteed.',
  },
  {
    icon: '⚡',
    bg: 'rgba(239,68,68,0.1)',
    title: 'Any document type',
    desc: 'CSV, Excel, PDF and Word all supported. Upload census data, sales reports, research surveys — whatever you have.',
  },
];

const steps = [
  { num: '01', title: 'Upload your file', desc: 'Drop a CSV, Excel, PDF or Word document. Up to 10MB.' },
  { num: '02', title: 'AI analyzes it', desc: 'Our model reads and reasons over your data in seconds.' },
  { num: '03', title: 'Review insights', desc: 'Explore stats, charts and a plain-English interpretation.' },
  { num: '04', title: 'Export your report', desc: 'Download as PDF or Word and share it instantly.' },
];

const Landing = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* HERO */}
      <section className={styles.hero}>
        <div>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            AI-powered data analysis
          </div>
          <h1 className={styles.heroTitle}>
            Turn raw data into <em>clear insight</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Upload any document, spreadsheet or PDF. AvelarAI analyzes it
            instantly — statistics, trends, charts and plain-English
            interpretation. No data skills required.
          </p>
          <div className={styles.heroActions}>
            <Link to="/register">
              <button className={styles.btnPrimary}>Analyze your data free</button>
            </Link>
            <Link to="/login">
              <button className={styles.btnGhost}>Sign in</button>
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.uploadZone}>
            <div className={styles.uploadIcon}>
              <svg viewBox="0 0 24 24">
                <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12M8 8l4-4 4 4" />
              </svg>
            </div>
            <p className={styles.uploadText}>
              <strong>Drop your file here</strong> or click to browse
            </p>
            <div className={styles.filePills}>
              {['CSV', 'Excel', 'PDF', 'Word'].map((t) => (
                <span key={t} className={styles.filePill}>{t}</span>
              ))}
            </div>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>2.4<span>K</span></div>
              <div className={styles.statLabel}>Rows analyzed</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statNum} ${styles.statAccent}`}>
                98<span style={{ fontSize: '1rem', color: 'var(--text2)' }}>%</span>
              </div>
              <div className={styles.statLabel}>Accuracy rate</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>
                0.8<span style={{ fontSize: '1rem' }}>s</span>
              </div>
              <div className={styles.statLabel}>Avg. analysis time</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <p className={styles.sectionLabel}>What AvelarAI does</p>
        <h2 className={styles.sectionTitle}>Everything you need to understand your data</h2>
        <p className={styles.sectionSubtitle}>
          From raw numbers to boardroom-ready reports — AvelarAI handles the
          heavy lifting so you can focus on decisions, not spreadsheets.
        </p>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <p className={styles.sectionLabel}>How it works</p>
          <h2 className={styles.sectionTitle}>Four steps to insight</h2>
          <p className={styles.sectionSubtitle}>
            No training required. No complicated setup. Just upload and get answers.
          </p>
          <div className={styles.stepsRow}>
            {steps.map((s) => (
              <div key={s.num} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaBox}>
          <h2>Ready to make your data <em>make sense?</em></h2>
          <p>
            Join thousands of analysts, researchers and business owners who use
            AvelarAI to turn raw data into clear, actionable insight.
          </p>
          <Link to="/register">
            <button className={styles.btnPrimary}>Get started for free</button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Built with care by <span>AvelarAI</span>, a TeX product · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default Landing;