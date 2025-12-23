import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [otherContents, setOtherContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
    fetchOtherContents();
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/contents/${id}`);
      setContent(response.data);
    } catch (err) {
      setError('İçerik bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherContents = async () => {
    try {
      const response = await axios.get('/contents?status=published');
      // Mevcut içeriği hariç tut ve en fazla 5 içerik göster
      const filtered = response.data
        .filter(c => c.id !== parseInt(id))
        .slice(0, 5);
      setOtherContents(filtered);
    } catch (err) {
      console.error('Diğer içerikler yüklenemedi:', err);
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

  if (error || !content) {
    return (
      <div className="card">
        <div className="alert alert-error">{error || 'İçerik bulunamadı'}</div>
        <button onClick={() => navigate('/contents')} className="btn btn-secondary">
          İçerikler Sayfasına Dön
        </button>
      </div>
    );
  }

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/contents')} className="btn btn-secondary">
          ← Geri Dön
        </button>
      </div>

      <div className="content-detail-layout">
        {/* Ana İçerik - Sol Taraf */}
        <div className="content-detail-main">
          <div className="card">
        <div style={{ marginBottom: '20px' }}>
          {content.category && (
            <span className="badge badge-info" style={{ marginBottom: '10px', display: 'inline-block' }}>
              {content.category}
            </span>
          )}
          <span className={`badge ${content.status === 'published' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '10px' }}>
            {content.status === 'published' ? 'Yayınlanmış' : 'Taslak'}
          </span>
        </div>

        <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
          {content.title}
        </h1>

        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Yazar:</strong> {content.author_name || 'Bilinmiyor'}
          </div>
          <div>
            <strong>Yayın Tarihi:</strong> {formatDate(content.created_at)}
          </div>
          {content.updated_at !== content.created_at && (
            <div style={{ marginTop: '5px' }}>
              <strong>Son Güncelleme:</strong> {formatDate(content.updated_at)}
            </div>
          )}
        </div>

        <div 
          style={{ 
            fontSize: '18px', 
            lineHeight: '1.8', 
            color: '#333',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          {content.content || 'İçerik bulunmuyor.'}
        </div>
      </div>
      </div>

        {/* Diğer Haberler - Sağ Taraf */}
        <div className="content-detail-sidebar">
          <div className="card" style={{ position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
              Diğer Haberler
            </h3>
            {otherContents.length === 0 ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Henüz başka haber bulunmuyor.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {otherContents.map(otherContent => (
                  <Link
                    key={otherContent.id}
                    to={`/contents/${otherContent.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      padding: '10px',
                      borderRadius: '5px',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '15px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#007bff',
                      marginBottom: '5px',
                      lineHeight: '1.4'
                    }}>
                      {otherContent.title}
                    </h4>
                    {otherContent.content && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        marginTop: '5px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {otherContent.content.length > 80 
                          ? otherContent.content.substring(0, 80) + '...' 
                          : otherContent.content}
                      </p>
                    )}
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#999', 
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span>{formatShortDate(otherContent.created_at)}</span>
                      {otherContent.category && (
                        <>
                          <span>•</span>
                          <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {otherContent.category}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;

