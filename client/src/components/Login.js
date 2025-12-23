import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin/login';
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', formData);
      onLogin(response.data.token, response.data.user);
      // Admin ise dashboard'a, değilse ana sayfaya yönlendir
      if (response.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="card-header">
          <h2 className="card-title">{isAdminLogin ? 'Yönetici Girişi' : 'Üye Girişi'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        {!isAdminLogin && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Hesabınız yok mu? </span>
            <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
              Üye Ol
            </Link>
          </div>
        )}
        {isAdminLogin && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Normal üye misiniz? </span>
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Üye Girişi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

