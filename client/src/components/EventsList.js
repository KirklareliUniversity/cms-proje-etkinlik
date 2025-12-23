import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventsList = ({ admin = false, user = null }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const endpoint = admin ? '/events' : '/events/active';
      const response = await axios.get(endpoint);
      setEvents(response.data);
    } catch (err) {
      setError('Etkinlikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`/events/${id}`);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      alert('Etkinlik silinemedi');
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
        <h1 className="card-title">{admin ? 'Etkinlik Yönetimi' : 'Etkinlikler'}</h1>
        {admin ? (
          <Link to="/dashboard/events/new" className="btn btn-success">
            Yeni Etkinlik
          </Link>
        ) : (
          user && (
            <Link to="/events/new" className="btn btn-success">
              Etkinlik Oluştur
            </Link>
          )
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {events.length === 0 ? (
        <div className="empty-state">
          <h3>Henüz etkinlik bulunmuyor</h3>
          {admin && (
            <Link to="/dashboard/events/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
              İlk Etkinliği Oluştur
            </Link>
          )}
        </div>
      ) : (
        <div className="grid">
          {events.map(event => (
            <div key={event.id} className="card">
              <h3>{event.title}</h3>
              {event.description && (
                <p style={{ marginTop: '10px', color: '#666' }}>
                  {event.description.length > 100 
                    ? event.description.substring(0, 100) + '...' 
                    : event.description}
                </p>
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
                <div style={{ marginTop: '5px' }}>
                  <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {event.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                {admin ? (
                  <>
                    <Link to={`/dashboard/events/edit/${event.id}`} className="btn btn-primary">
                      Düzenle
                    </Link>
                    <Link to={`/dashboard/events/${event.id}/registrations`} className="btn btn-info">
                      Kayıtlar ({event.registered_count || 0})
                    </Link>
                    <button onClick={() => handleDelete(event.id)} className="btn btn-danger">
                      Sil
                    </button>
                  </>
                ) : (
                  <>
                    {user && user.role !== 'admin' ? (
                      event.author_id === user.id ? (
                        <>
                          <Link to={`/events/edit/${event.id}`} className="btn btn-primary">
                            Düzenle
                          </Link>
                          <button onClick={() => handleDelete(event.id)} className="btn btn-danger">
                            Sil
                          </button>
                        </>
                      ) : (
                        <Link to={`/events/register/${event.id}`} className="btn btn-primary">
                          Kayıt Ol
                        </Link>
                      )
                    ) : !user ? (
                      <Link to="/login" className="btn btn-primary">
                        Kayıt Olmak İçin Giriş Yapın
                      </Link>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;

