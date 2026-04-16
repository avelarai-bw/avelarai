import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './VerifyEmail.module.css';

type Status = 'loading' | 'success' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in this link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    verify();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>

            {/* ICON */}
            <div className={`${styles.iconWrap} ${styles[status]}`}>
              {status === 'loading' && <div className={styles.spinner} />}
              {status === 'success' && <span style={{ fontSize: 28 }}>✓</span>}
              {status === 'error'   && <span style={{ fontSize: 28 }}>✕</span>}
            </div>

            {/* LOADING */}
            {status === 'loading' && (
              <>
                <h2 className={styles.cardTitle}>Verifying your email</h2>
                <p className={styles.cardSubtitle}>Please wait a moment...</p>
              </>
            )}

            {/* SUCCESS */}
            {status === 'success' && (
              <>
                <h2 className={`${styles.cardTitle} ${styles.success}`}>Email Verified</h2>
                <p className={styles.cardSubtitle}>{message}</p>
                <div className={styles.redirectNote}>
                  <span>↗</span> Redirecting you to login...
                </div>
                <button className={styles.btn} onClick={() => navigate('/login')}>
                  Go to Login
                </button>
              </>
            )}

            {/* ERROR */}
            {status === 'error' && (
              <>
                <h2 className={`${styles.cardTitle} ${styles.error}`}>Verification Failed</h2>
                <p className={styles.cardSubtitle}>{message}</p>
                <button className={styles.btn} onClick={() => navigate('/login')}>
                  Back to Login
                </button>
                <button className={styles.btnOutline} onClick={() => navigate('/register')}>
                  Create a new account
                </button>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;