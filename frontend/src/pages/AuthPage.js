import React, { useState } from 'react';
import { signupUser, loginUser } from '../services/api';
import '../custom-auth.css';

const AuthPage = ({ onLogin, onLogout }) => {
  // Auto logout on tab/browser close: clear user from storage
  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Remove user/session data from localStorage/sessionStorage
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      // Call backend logout API to invalidate session/cookie
      try {
        // Use sendBeacon for reliability on tab/browser close
        navigator.sendBeacon && navigator.sendBeacon('/api/logout');
      } catch (e) {
        // Fallback: fetch (may not always complete)
        fetch('/api/logout', { method: 'POST', credentials: 'include', keepalive: true });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, contact, password } = formData;
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let data;
      if (isLoginView) {
        data = await loginUser({ email, password });
      } else {
        data = await signupUser({ name, email, contact, password });
      }
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLoginView ? 'WELCOME' : 'Create an Account'}</h2>
        {isLoginView && (
          <div className="auth-subtitle">Please login to continue</div>
        )}
        <form className="auth-form" onSubmit={onSubmit}>
          {!isLoginView && (
            <div>
              <label className="auth-label flex items-center gap-2">
                <span role="img" aria-label="user">👤</span> Name
              </label>
              <input type="text" name="name" value={name} onChange={onChange} required className="auth-input"/>
            </div>
          )}
          <div>
            <label className="auth-label flex items-center gap-2">
              <span role="img" aria-label="email">✉️</span> Email
            </label>
            <input type="email" name="email" value={email} onChange={onChange} required className="auth-input"/>
          </div>
          {!isLoginView && (
            <div>
              <label className="auth-label flex items-center gap-2">
                <span role="img" aria-label="phone">📞</span> Contact Number
              </label>
              <input type="text" name="contact" value={contact} onChange={onChange} className="auth-input"/>
            </div>
          )}
          <div>
            <label className="auth-label flex items-center gap-2">
              <span role="img" aria-label="password">🔒</span> Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={onChange}
              required
              className="auth-input"
              style={{ width: '100%' }}
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-700 select-none cursor-pointer">
                Show/hide password
              </label>
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Processing...' : isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-switch">
          {isLoginView ? 'Need an account?' : 'Already have an account?'}
          <span onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? 'Sign Up' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;