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
 // const { login } = useAuth();

  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const { data } = await api.post<AuthResponse>(endpoint, payload);
     onLogin(data.token, data.user);
navigate('/upload');
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const perks = isLogin ? loginPerks : registerPerks;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* LEFT */}
          <div className={styles.left}>
            <Link to="/" className={styles.backLink}>
              ← Back to home
            </Link>
            <div className={styles.badge}>AvelarAI</div>
            <h1 className={styles.title}>
              {isLogin ? (
                <>Welcome <em>back</em></>
              ) : (
                <>Start analyzing <em>for free</em></>
              )}
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

            {serverError && (
              <div className={styles.errorBanner}>{serverError}</div>
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
                  {errors.username && (
                    <span className={styles.fieldError}>{errors.username}</span>
                  )}
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
                {errors.email && (
                  <span className={styles.fieldError}>{errors.email}</span>
                )}
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
                {errors.password && (
                  <span className={styles.fieldError}>{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
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