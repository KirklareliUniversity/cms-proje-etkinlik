import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    events: 0,
    activeEvents: 0,
    registrations: 0,
    contents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [eventsRes, activeEventsRes, contentsRes] = await Promise.all([
        axios.get('/events'),
        axios.get('/events/active'),
        axios.get('/contents')
      ]);

      // Kayıt sayısını hesapla
      let totalRegistrations = 0;
      for (const event of eventsRes.data) {
        totalRegistrations += event.registered_count || 0;
      }

      setStats({
        events: eventsRes.data.length,
        activeEvents: activeEventsRes.data.length,
        registrations: totalRegistrations,
        contents: contentsRes.data.length
      });
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">Yönetim Paneli</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="card">
          <h3>Toplam Etkinlik</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#007bff', marginTop: '10px' }}>
            {stats.events}
          </div>
        </div>
        <div className="card">
          <h3>Aktif Etkinlik</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745', marginTop: '10px' }}>
            {stats.activeEvents}
          </div>
        </div>
        <div className="card">
          <h3>Toplam Kayıt</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107', marginTop: '10px' }}>
            {stats.registrations}
          </div>
        </div>
        <div className="card">
          <h3>Toplam İçerik</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#17a2b8', marginTop: '10px' }}>
            {stats.contents}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '30px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Hızlı İşlemler - Etkinlikler</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/dashboard/events" className="btn btn-primary">
              Tüm Etkinlikleri Görüntüle
            </Link>
            <Link to="/dashboard/events/new" className="btn btn-success">
              Yeni Etkinlik Oluştur
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Hızlı İşlemler - İçerikler</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/dashboard/contents" className="btn btn-primary">
              Tüm İçerikleri Görüntüle
            </Link>
            <Link to="/dashboard/contents/new" className="btn btn-success">
              Yeni İçerik Oluştur
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

