import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, registrationsRes] = await Promise.all([
        axios.get(`/events/${id}`),
        axios.get(`/events/${id}/registrations`)
      ]);
      setEvent(eventRes.data);
      setRegistrations(registrationsRes.data);
    } catch (err) {
      setError('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`/events/${id}/registrations/${registrationId}`);
      // Kayıtları ve etkinlik bilgilerini yeniden yükle
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Kayıt silinemedi');
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

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">
          {event ? `${event.title} - Kayıtlar` : 'Etkinlik Kayıtları'}
        </h1>
        <button onClick={() => navigate('/dashboard/events')} className="btn btn-secondary">
          Geri Dön
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {event && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Etkinlik Bilgileri</h3>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            <div><strong>Toplam Kayıt:</strong> {event.registered_count || 0}</div>
            {event.capacity && (
              <div style={{ marginTop: '5px' }}>
                <strong>Kapasite:</strong> {event.capacity}
              </div>
            )}
          </div>
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="empty-state">
          <h3>Henüz kayıt bulunmuyor</h3>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Notlar</th>
                <th>Kayıt Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id}>
                  <td>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td>{reg.phone || '-'}</td>
                  <td>{reg.notes || '-'}</td>
                  <td>{formatDate(reg.registered_at)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(reg.id)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;

