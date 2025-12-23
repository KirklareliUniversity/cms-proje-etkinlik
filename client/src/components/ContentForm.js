import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ContentForm = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/contents/${id}`);
      const content = response.data;
      setFormData({
        title: content.title || '',
        content: content.content || '',
        category: content.category || '',
        status: content.status || 'draft'
      });
    } catch (err) {
      setError('İçerik yüklenemedi');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        category: formData.category || null
      };

      if (id) {
        await axios.put(`/contents/${id}`, data);
      } else {
        await axios.post('/contents', data);
      }
      const backPath = user?.role === 'admin' ? '/dashboard/contents' : '/contents';
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
        <h1 className="card-title">{id ? 'İçerik Düzenle' : 'Yeni İçerik Oluştur'}</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Başlık *</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Kategori Seçin</option>
              <option value="haber">Haber</option>
              <option value="duyuru">Duyuru</option>
              <option value="blog">Blog</option>
              <option value="diger">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label>İçerik *</label>
            <textarea
              className="form-control"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              className="form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Taslak</option>
              <option value="published">Yayınlanmış</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Oluştur')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(user?.role === 'admin' ? '/dashboard/contents' : '/contents')}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentForm;

