const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Veritabanı bağlantısı
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Veritabanı tablolarını oluştur
db.serialize(() => {
  // Kullanıcılar tablosu
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Etkinlikler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_date DATETIME NOT NULL,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
  author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

// Mevcut tabloda author_id sütunu yoksa ekle (hata verirse yoksay)
db.run('ALTER TABLE events ADD COLUMN author_id INTEGER', (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('author_id sütunu eklenemedi:', err.message);
  }
});

  // Etkinlik kayıtları tablosu
  db.run(`CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
  )`);

  // İçerikler tablosu
  db.run(`CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    status TEXT DEFAULT 'draft',
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )`);

  // Varsayılan admin kullanıcı oluştur
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES ('admin', 'admin@example.com', ?, 'admin')`, [defaultPassword]);
});

// JWT doğrulama middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
};

// Admin kontrolü middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Bu işlem için admin yetkisi gereklidir' });
  }
};

// ========== AUTH ROUTES ==========
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Hatalı şifre' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Üye kayıt
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  // Validasyon
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
  }

  // Email format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
  }

  // Kullanıcı adı ve email kontrolü
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }

    // Şifreyi hashle
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Yeni kullanıcı oluştur (role default 'user')
    db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Kullanıcı oluşturulamadı' });
        }

        // Token oluştur ve döndür
        const token = jwt.sign(
          { id: this.lastID, username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          token,
          user: {
            id: this.lastID,
            username,
            email,
            role: 'user'
          },
          message: 'Kayıt başarılı'
        });
      }
    );
  });
});

// ========== EVENTS ROUTES ==========
// Tüm etkinlikleri getir
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY event_date DESC', (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json(events);
  });
});

// Aktif etkinlikleri getir (public)
app.get('/api/events/active', (req, res) => {
  db.all('SELECT * FROM events WHERE status = ? AND event_date >= datetime("now") ORDER BY event_date ASC', 
    ['active'], (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json(events);
  });
});

// Tek etkinlik getir
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }
    res.json(event);
  });
});

// Yeni etkinlik oluştur (admin + user). author_id oturumu açan kullanıcıdır.
app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, location, event_date, capacity, status } = req.body;
  const author_id = req.user.id;

  db.run(
    `INSERT INTO events (title, description, location, event_date, capacity, status, author_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, location, event_date, capacity || null, status || 'active', author_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Etkinlik oluşturulamadı' });
      }
      res.json({ id: this.lastID, message: 'Etkinlik oluşturuldu', author_id });
    }
  );
});

// Etkinlik güncelle (admin veya kendi etkinliği)
app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, location, event_date, capacity, status } = req.body;

  db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }

    const isOwner = event.author_id && event.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Bu etkinliği güncelleme izniniz yok' });
    }

    db.run(
      `UPDATE events SET title = ?, description = ?, location = ?, event_date = ?, 
       capacity = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, description, location, event_date, capacity || null, status, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Etkinlik güncellenemedi' });
        }
        res.json({ message: 'Etkinlik güncellendi' });
      }
    );
  });
});

// Etkinlik sil (admin veya kendi etkinliği)
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }

    const isOwner = event.author_id && event.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Bu etkinliği silme izniniz yok' });
    }

    db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Etkinlik silinemedi' });
      }
      res.json({ message: 'Etkinlik silindi' });
    });
  });
});

// ========== EVENT REGISTRATIONS ROUTES ==========
// Etkinlik kaydı oluştur (sadece giriş yapmış kullanıcılar)
app.post('/api/events/:id/register', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, notes } = req.body;
  
  // Sadece üyeler kayıt olabilir (admin değil)
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Yöneticiler etkinliğe kayıt olamaz' });
  }

  // Etkinlik kapasitesini kontrol et
  db.get('SELECT capacity, registered_count FROM events WHERE id = ?', [id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }
    if (event.capacity && event.registered_count >= event.capacity) {
      return res.status(400).json({ error: 'Etkinlik dolu' });
    }

    db.run(
      `INSERT INTO event_registrations (event_id, name, email, phone, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, phone || null, notes || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Kayıt oluşturulamadı' });
        }

        // Kayıt sayısını güncelle
        db.run('UPDATE events SET registered_count = registered_count + 1 WHERE id = ?', [id]);
        
        res.json({ id: this.lastID, message: 'Kayıt başarılı' });
      }
    );
  });
});

// Etkinlik kayıtlarını getir
app.get('/api/events/:id/registrations', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM event_registrations WHERE event_id = ? ORDER BY registered_at DESC',
    [id],
    (err, registrations) => {
      if (err) {
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }
      res.json(registrations);
    }
  );
});

// Etkinlik kaydını sil
app.delete('/api/events/:eventId/registrations/:registrationId', authenticateToken, requireAdmin, (req, res) => {
  const { eventId, registrationId } = req.params;

  // Önce kaydın var olup olmadığını kontrol et
  db.get('SELECT * FROM event_registrations WHERE id = ? AND event_id = ?', [registrationId, eventId], (err, registration) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!registration) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    // Kaydı sil
    db.run('DELETE FROM event_registrations WHERE id = ?', [registrationId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Kayıt silinemedi' });
      }

      // Etkinlikteki kayıt sayısını azalt
      db.run('UPDATE events SET registered_count = registered_count - 1 WHERE id = ?', [eventId], (err) => {
        if (err) {
          console.error('Kayıt sayısı güncellenemedi:', err);
        }
      });

      res.json({ message: 'Kayıt başarıyla silindi' });
    });
  });
});

// ========== CONTENTS ROUTES ==========
// Tüm içerikleri getir
app.get('/api/contents', (req, res) => {
  const { category, status } = req.query;
  let query = 'SELECT c.*, u.username as author_name FROM contents c LEFT JOIN users u ON c.author_id = u.id';
  const params = [];

  if (category || status) {
    const conditions = [];
    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY c.created_at DESC';

  db.all(query, params, (err, contents) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json(contents);
  });
});

// Tek içerik getir
app.get('/api/contents/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    'SELECT c.*, u.username as author_name FROM contents c LEFT JOIN users u ON c.author_id = u.id WHERE c.id = ?',
    [id],
    (err, content) => {
      if (err) {
        return res.status(500).json({ error: 'Veritabanı hatası' });
      }
      if (!content) {
        return res.status(404).json({ error: 'İçerik bulunamadı' });
      }
      res.json(content);
    }
  );
});

// Yeni içerik oluştur (admin + user)
app.post('/api/contents', authenticateToken, (req, res) => {
  const { title, content, category, status } = req.body;
  const author_id = req.user.id;

  db.run(
    `INSERT INTO contents (title, content, category, status, author_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [title, content, category || null, status || 'draft', author_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'İçerik oluşturulamadı' });
      }
      res.json({ id: this.lastID, message: 'İçerik oluşturuldu', author_id });
    }
  );
});

// İçerik güncelle (admin veya kendi içeriği)
app.put('/api/contents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, category, status } = req.body;

  db.get('SELECT * FROM contents WHERE id = ?', [id], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!existing) {
      return res.status(404).json({ error: 'İçerik bulunamadı' });
    }

    const isOwner = existing.author_id && existing.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Bu içeriği güncelleme izniniz yok' });
    }

    db.run(
      `UPDATE contents SET title = ?, content = ?, category = ?, status = ?, 
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, content, category || null, status, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'İçerik güncellenemedi' });
        }
        res.json({ message: 'İçerik güncellendi' });
      }
    );
  });
});

// İçerik sil (admin veya kendi içeriği)
app.delete('/api/contents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM contents WHERE id = ?', [id], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    if (!existing) {
      return res.status(404).json({ error: 'İçerik bulunamadı' });
    }

    const isOwner = existing.author_id && existing.author_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Bu içeriği silme izniniz yok' });
    }

    db.run('DELETE FROM contents WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'İçerik silinemedi' });
      }
      res.json({ message: 'İçerik silindi' });
    });
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Veritabanı bağlantısı kapatıldı.');
    process.exit(0);
  });
});

