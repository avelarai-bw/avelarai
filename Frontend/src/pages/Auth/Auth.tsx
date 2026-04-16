import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';

import api from '../../services/api';
import type { AuthResponse } from '../../types';
import styles from './Auth.module.css';

interface Props {
  mode: 'login' | 'register';
  onLogin: (token: string, user: any) => void;
}

interface FormState {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
}

const registerPerks = [
  '5 free analyses every month',
  'CSV, Excel, PDF and Word support',
  'AI-powered plain-English interpretation',
  'Export to PDF and Word reports',
  'Auto-generated charts and visualizations',
];

const loginPerks = [
  'Pick up right where you left off',
  'Access your full analysis history',
  'Re-export any previous report',
  'Upgrade to paid anytime',
];

const Auth = ({ mode, onLogin }: Props) => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // verification-specific state
  const [showUnverified, setShowUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // registration success state
  const [registered, setRegistered] = useState(false);

  const isLogin = mode === 'login';

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isLogin && !form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!isLogin && form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError('');
    if (showUnverified) {
      setShowUnverified(false);
      setResendMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    setShowUnverified(false);
    setResendMessage('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const { data } = await api.post<AuthResponse>(endpoint, payload);

      if (!isLogin) {
        // registration no longer returns a token — show success state
        setRegistered(true);
        return;
      }

      onLogin(data.token, data.user);
      navigate('/upload');
    } catch (err: any) {
      const data = err.response?.data;

      if (data?.unverified) {
        setShowUnverified(true);
        setServerError(data.message || 'Please verify your email before logging in.');
      } else {
        setServerError(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const { data } = await api.post('/resend-verification', { email: form.email });
      setResendMessage(data.message);
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const perks = isLogin ? loginPerks : registerPerks;

  // ── Registration success screen ───────────────────────────────────────────
  if (registered) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.left}>
              <Link to="/" className={styles.backLink}>← Back to home</Link>
              <div className={styles.badge}>AvelarAI</div>
              <h1 className={styles.title}>Check your <em>inbox</em></h1>
              <p className={styles.subtitle}>
                We've sent a verification link to <strong>{form.email}</strong>.
                Click it to activate your account and start analyzing.
              </p>
            </div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Almost there</h2>
              <p className={styles.cardSubtitle}>
                Didn't receive the email?{' '}
                <Link to="/login">Go to login</Link>
              </p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Check your spam folder too. The link expires in 24 hours.
              </p>
              <button
                className={styles.submitBtn}
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <><span className={styles.spinner} /> Resending...</>
                ) : (
                  'Resend verification email'
                )}
              </button>
              {resendMessage && (
                <p style={{ fontSize: 13, color: 'var(--accent)', marginTop: '0.75rem', textAlign: 'center' }}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Main auth form ─────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* LEFT */}
          <div className={styles.left}>
            <Link to="/" className={styles.backLink}>← Back to home</Link>
            <div className={styles.badge}>AvelarAI</div>
            <h1 className={styles.title}>
              {isLogin ? (<>Welcome <em>back</em></>) : (<>Start analyzing <em>for free</em></>)}
            </h1>
            <p className={styles.subtitle}>
              {isLogin
                ? 'Sign in to access your analyses, history and reports.'
                : 'Create your free account and upload your first dataset in under a minute.'}
            </p>
            <div className={styles.perks}>
              {perks.map((p) => (
                <div key={p} className={styles.perk}>
                  <div className={styles.perkIcon}>✓</div>
                  <span className={styles.perkText}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - FORM CARD */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className={styles.cardSubtitle}>
              {isLogin ? (
                <>Don't have an account? <Link to="/register">Sign up free</Link></>
              ) : (
                <>Already have an account? <Link to="/login">Sign in</Link></>
              )}
            </p>

            {/* ERROR BANNER */}
            {serverError && (
              <div className={styles.errorBanner}>
                <p style={{ margin: 0 }}>{serverError}</p>
                {showUnverified && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(239,68,68,0.2)' }}>
                    {resendMessage ? (
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--accent)' }}>{resendMessage}</p>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 12,
                          color: '#ef4444',
                          textDecoration: 'underline',
                          cursor: resendLoading ? 'not-allowed' : 'pointer',
                          opacity: resendLoading ? 0.6 : 1,
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {resendLoading ? 'Sending...' : 'Resend verification email'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              {!isLogin && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Username</label>
                  <input
                    className={`${styles.input} ${errors.username ? styles.error : ''}`}
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                  {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  className={`${styles.input} ${errors.password ? styles.error : ''}`}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <><span className={styles.spinner} />{isLogin ? 'Signing in...' : 'Creating account...'}</>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Auth;