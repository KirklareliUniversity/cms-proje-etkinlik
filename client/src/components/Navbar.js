import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const getBrandName = () => {
    if (!user) {
      return 'Pars Maximum';
    }
    if (user.role === 'admin') {
      return 'Pars Maximum Yönetim';
    }
    return 'Pars Maximum';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          {getBrandName()}
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Etkinlikler</Link>
          <Link to="/contents" className="navbar-link">İçerikler</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/dashboard" className="navbar-link">Yönetim Paneli</Link>
              )}
              <span className="navbar-user">Hoş geldin, {user.username}</span>
              <button onClick={onLogout} className="btn btn-secondary btn-sm">
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="navbar-link">Üye Ol</Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                Giriş Yap
              </Link>
              <Link to="/admin/login" className="btn btn-secondary btn-sm">
                Yönetici Girişi
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

