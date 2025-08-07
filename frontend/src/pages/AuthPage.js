import React, { useState } from 'react';
import { signupUser, loginUser } from '../services/api';

const AuthPage = ({ onLogin }) => {
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
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 text-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl card-shadow flex flex-col items-center justify-center shadow-2xl border border-gray-200 text-center mx-auto">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-2 tracking-tight uppercase">
          {isLoginView ? 'WELCOME' : 'Create an Account'}
        </h2>
        {isLoginView && (
          <div className="text-gray-600 mb-4 text-base font-medium">Please login to continue</div>
        )}
        <div className="w-full bg-gray-50 rounded-xl shadow-inner p-6 mb-2 text-center mx-auto">
          <form className="space-y-6 text-center mx-auto" onSubmit={onSubmit}>
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span role="img" aria-label="user">👤</span> Name
                </label>
                <input type="text" name="name" value={name} onChange={onChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow focus:ring-blue-400 focus:border-blue-400 transition"/>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <span role="img" aria-label="email">✉️</span> Email
              </label>
              <input type="email" name="email" value={email} onChange={onChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow focus:ring-blue-400 focus:border-blue-400 transition"/>
            </div>
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span role="img" aria-label="phone">📞</span> Contact Number
                </label>
                <input type="text" name="contact" value={contact} onChange={onChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow focus:ring-blue-400 focus:border-blue-400 transition"/>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <span role="img" aria-label="password">🔒</span> Password
              </label>
              <input type="password" name="password" value={password} onChange={onChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow focus:ring-blue-400 focus:border-blue-400 transition"/>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 shadow-lg">
                {loading ? 'Processing...' : isLoginView ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
        <div className="text-sm text-center">
          <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-blue-600 hover:text-blue-500">
            {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;