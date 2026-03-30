import { Link, useNavigate } from 'react-router-dom';
//import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

interface NavbarProps {
  user?: any;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

const Navbar = ({ user, onLogout, isAuthenticated = false }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        Avelar<span>AI</span>
      </Link>

      <ul className={styles.links}>
        {isAuthenticated && (
          <>
            <li><Link to="/upload">Analyze</Link></li>
            <li><Link to="/history">History</Link></li>
          </>
        )}
      </ul>

      <div className={styles.actions}>
        {isAuthenticated ? (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <span className={styles.username}>{user?.username}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Sign out
            </button>
          </div>
        ) : (
          <>
            <Link to="/login">
              <button className={styles.btnGhost}>Sign in</button>
            </Link>
            <Link to="/register">
              <button className={styles.btnPrimary}>Get started free</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;