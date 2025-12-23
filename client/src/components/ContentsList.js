import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ContentsList = ({ admin = false, user = null }) => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ category: '', status: '' });

  useEffect(() => {
    fetchContents();
  }, [filter]);

  const fetchContents = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);

      const response = await axios.get(`/contents?${params.toString()}`);
      setContents(response.data);
    } catch (err) {
      setError('İçerikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await axios.delete(`/contents/${id}`);
      setContents(contents.filter(content => content.id !== id));
    } catch (err) {
      alert('İçerik silinemedi');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">{admin ? 'İçerik Yönetimi' : 'İçerikler'}</h1>
        {admin ? (
          <Link to="/dashboard/contents/new" className="btn btn-success">
            Yeni İçerik
          </Link>
        ) : (
          user && (
            <Link to="/contents/new" className="btn btn-success">
              İçerik Oluştur
            </Link>
          )
        )}
      </div>

      {admin && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: '0' }}>
              <label>Kategori Filtresi</label>
              <select
                className="form-control"
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="">Tüm Kategoriler</option>
                <option value="haber">Haber</option>
                <option value="duyuru">Duyuru</option>
                <option value="blog">Blog</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: '0' }}>
              <label>Durum Filtresi</label>
              <select
                className="form-control"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">Tüm Durumlar</option>
                <option value="published">Yayınlanmış</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {contents.length === 0 ? (
        <div className="empty-state">
          <h3>Henüz içerik bulunmuyor</h3>
          {admin ? (
            <Link to="/dashboard/contents/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
              İlk İçeriği Oluştur
            </Link>
          ) : (
            user && (
              <Link to="/contents/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
                İlk İçeriği Oluştur
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="grid">
          {contents.map(content => (
            <div key={content.id} className="card">
              <Link to={`/contents/${content.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ color: '#007bff', cursor: 'pointer' }}>{content.title}</h3>
              </Link>
              {content.category && (
                <span className="badge badge-info" style={{ marginTop: '10px', display: 'inline-block' }}>
                  {content.category}
                </span>
              )}
              {content.content && (
                <Link to={`/contents/${content.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p style={{ marginTop: '10px', color: '#666', cursor: 'pointer' }}>
                    {content.content.length > 150 
                      ? content.content.substring(0, 150) + '...' 
                      : content.content}
                  </p>
                </Link>
              )}
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                <div>
                  <strong>Yazar:</strong> {content.author_name || 'Bilinmiyor'}
                </div>
                <div style={{ marginTop: '5px' }}>
                  <strong>Tarih:</strong> {formatDate(content.created_at)}
                </div>
                <div style={{ marginTop: '5px' }}>
                  <span className={`badge ${content.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                    {content.status === 'published' ? 'Yayınlanmış' : 'Taslak'}
                  </span>
                </div>
              </div>
              {(admin || (user && content.author_id === user.id)) && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <Link
                    to={
                      admin
                        ? `/dashboard/contents/edit/${content.id}`
                        : `/contents/edit/${content.id}`
                    }
                    className="btn btn-primary"
                  >
                    Düzenle
                  </Link>
                  <button onClick={() => handleDelete(content.id)} className="btn btn-danger">
                    Sil
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentsList;

