import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EventRegister = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    if (!user || user.role === 'admin') {
      navigate('/');
      return;
    }
    fetchEvent();
    // Formu kullanıcı bilgileriyle doldur
    setFormData({
      name: user.username || '',
      email: user.email || '',
      phone: '',
      notes: ''
    });
  }, [id, user, navigate]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      setEvent(response.data);
    } catch (err) {
      setError('Etkinlik bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axios.post(`/events/${id}/register`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!event) {
    return (
      <div className="card">
        <div className="alert alert-error">Etkinlik bulunamadı</div>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
        <div className="alert alert-success">
          <h3>Kayıt Başarılı!</h3>
          <p>Etkinliğe başarıyla kaydoldunuz. Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2>{event.title}</h2>
        {event.description && (
          <p style={{ marginTop: '10px', color: '#666' }}>{event.description}</p>
        )}
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          <div><strong>📍 Konum:</strong> {event.location || 'Belirtilmemiş'}</div>
          <div style={{ marginTop: '5px' }}>
            <strong>📅 Tarih:</strong> {formatDate(event.event_date)}
          </div>
          {event.capacity && (
            <div style={{ marginTop: '5px' }}>
              <strong>👥 Kapasite:</strong> {event.registered_count || 0} / {event.capacity}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '20px' }}>Etkinlik Kayıt Formu</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ad Soyad *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>E-posta *</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Notlar</label>
            <textarea
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="4"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventRegister;

