import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import EventsList from './components/EventsList';
import EventForm from './components/EventForm';
import EventRegister from './components/EventRegister';
import ContentsList from './components/ContentsList';
import ContentForm from './components/ContentForm';
import ContentDetail from './components/ContentDetail';
import EventRegistrations from './components/EventRegistrations';

// API base URL
axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Token'ı doğrula ve kullanıcı bilgisini al
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/admin/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/" element={!user ? <Navigate to="/login" /> : <EventsList user={user} />} />
            <Route path="/events/register/:id" element={user && user.role !== 'admin' ? <EventRegister user={user} /> : <Navigate to="/login" />} />
            <Route path="/contents" element={<ContentsList user={user} />} />
            <Route path="/contents/:id" element={<ContentDetail />} />
            <Route path="/contents/new" element={user ? <ContentForm user={user} /> : <Navigate to="/login" />} />
            <Route path="/contents/edit/:id" element={user ? <ContentForm user={user} /> : <Navigate to="/login" />} />
            <Route
              path="/dashboard"
              element={user && user.role === 'admin' ? <Dashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/events"
              element={user && user.role === 'admin' ? <EventsList admin={true} user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/events/new"
              element={user && user.role === 'admin' ? <EventForm user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/events/edit/:id"
              element={user && user.role === 'admin' ? <EventForm user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/events/new"
              element={user ? <EventForm user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/events/edit/:id"
              element={user ? <EventForm user={user} /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/events/:id/registrations"
              element={user && user.role === 'admin' ? <EventRegistrations /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/contents"
              element={user && user.role === 'admin' ? <ContentsList admin={true} /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/contents/new"
              element={user && user.role === 'admin' ? <ContentForm user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/contents/edit/:id"
              element={user && user.role === 'admin' ? <ContentForm user={user} /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

