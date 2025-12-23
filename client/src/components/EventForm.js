import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EventForm = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    capacity: '',
    status: 'active'
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      const event = response.data;
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        event_date: event.event_date ? event.event_date.slice(0, 16) : '',
        capacity: event.capacity || '',
        status: event.status || 'active'
      });
    } catch (err) {
      setError('Etkinlik yüklenemedi');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (id) {
        await axios.put(`/events/${id}`, data);
      } else {
        await axios.post('/events', data);
      }
      const backPath = user?.role === 'admin' ? '/dashboard/events' : '/';
      navigate(backPath);
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">{id ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Oluştur'}</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Etkinlik Başlığı *</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Konum</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Etkinlik Tarihi ve Saati *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Kapasite (Boş bırakılabilir)</label>
            <input
              type="number"
              className="form-control"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              className="form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Oluştur')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(user?.role === 'admin' ? '/dashboard/events' : '/')}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;

