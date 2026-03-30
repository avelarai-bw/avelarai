import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Landing from './pages/Landing/Landing';
import Auth from './pages/Auth/Auth';
import Upload from './pages/Upload/Upload';
import Dashboard from './pages/Dashboard/Dashboard';
import History from './pages/History/History';
import type { User } from './types';

function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('avelarai_token')
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('avelarai_user');
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!token;

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('avelarai_token', newToken);
    localStorage.setItem('avelarai_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('avelarai_token');
    localStorage.removeItem('avelarai_user');
    setToken(null);
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          !isAuthenticated
            ? <Auth mode="login" onLogin={login} />
            : <Navigate to="/upload" replace />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated
            ? <Auth mode="register" onLogin={login} />
            : <Navigate to="/upload" replace />
        }
      />
      <Route
        path="/upload"
        element={
          isAuthenticated
            ? <Upload user={user} onLogout={logout} />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/dashboard/:id"
        element={
          isAuthenticated
            ? <Dashboard user={user} onLogout={logout} />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/history"
        element={
          isAuthenticated
            ? <History user={user} onLogout={logout} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;