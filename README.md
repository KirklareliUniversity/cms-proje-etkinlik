# CMS - Etkinlik Kayıt ve İçerik Yönetim Sistemi

İçerik yönetim sistemi dersi için geliştirilmiş etkinlik kayıt ve içerik yönetim paneli.

## Özellikler

### Etkinlik Yönetimi
- Etkinlik oluşturma, düzenleme ve silme
- Etkinlik kayıt sistemi
- Kapasite takibi
- Etkinlik durumu yönetimi (aktif/pasif)
- Kayıt listesi görüntüleme

### İçerik Yönetimi
- İçerik oluşturma, düzenleme ve silme
- Kategori yönetimi
- İçerik durumu (taslak/yayınlanmış)
- İçerik filtreleme

### Kullanıcı Yönetimi
- Üye kayıt sistemi
- Admin ve kullanıcı rolleri
- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (sadece adminler yönetim paneli kullanabilir)

## Teknolojiler

### Backend
- Node.js
- Express.js
- SQLite
- JWT (JSON Web Token)
- bcryptjs

### Frontend
- React
- React Router
- Axios
- CSS3

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın veya indirin**

2. **Tüm bağımlılıkları yükleyin:**
   ```bash
   npm run install-all
   ```

3. **Backend ve Frontend'i birlikte çalıştırın:**
   ```bash
   npm run dev
   ```

   Veya ayrı ayrı çalıştırmak için:
   
   **Backend:**
   ```bash
   npm run server
   ```
   
   **Frontend:**
   ```bash
   npm run client
   ```

4. **Uygulamaya erişim:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Kullanıcı Rolleri

### Admin
- Yönetim paneline erişim
- Etkinlik ve içerik yönetimi
- Kayıt listelerini görüntüleme

### Üye (User)
- Etkinliklere kayıt olma
- İçerikleri görüntüleme
- Yönetim paneline erişim yok

## Varsayılan Giriş Bilgileri

**Admin:**
- **Kullanıcı Adı:** `admin`
- **Şifre:** `admin123`

**Not:** Yeni üyeler kayıt sayfasından üye olabilirler.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi (admin ve üye)
- `POST /api/auth/register` - Üye kaydı

### Events
- `GET /api/events` - Tüm etkinlikler (admin)
- `GET /api/events/active` - Aktif etkinlikler (public)
- `GET /api/events/:id` - Tek etkinlik
- `POST /api/events` - Yeni etkinlik (admin)
- `PUT /api/events/:id` - Etkinlik güncelle (admin)
- `DELETE /api/events/:id` - Etkinlik sil (admin)

### Event Registrations
- `POST /api/events/:id/register` - Etkinlik kaydı (public)
- `GET /api/events/:id/registrations` - Kayıt listesi (admin)

### Contents
- `GET /api/contents` - Tüm içerikler
- `GET /api/contents/:id` - Tek içerik
- `POST /api/contents` - Yeni içerik (admin)
- `PUT /api/contents/:id` - İçerik güncelle (admin)
- `DELETE /api/contents/:id` - İçerik sil (admin)

## Proje Yapısı

```
CMS Proje/
├── server/
│   ├── index.js          # Backend ana dosyası
│   └── database.sqlite   # SQLite veritabanı (otomatik oluşur)
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/   # React componentleri
│   │   ├── App.js        # Ana uygulama
│   │   └── index.js      # Giriş noktası
│   └── package.json
├── package.json
└── README.md
```

## Kullanım

### Etkinlik Oluşturma
1. Yönetim paneline giriş yapın
2. "Yönetim Paneli" > "Yeni Etkinlik Oluştur"
3. Etkinlik bilgilerini doldurun
4. Kaydedin

### Üye Kaydı
1. Ana sayfadan "Üye Ol" linkine tıklayın
2. Kayıt formunu doldurun (kullanıcı adı, e-posta, şifre)
3. Kayıt olun ve otomatik olarak giriş yapın

### Etkinlik Kaydı
1. Ana sayfadan bir etkinlik seçin
2. "Kayıt Ol" butonuna tıklayın
3. Formu doldurun
4. Kayıt olun

### İçerik Yönetimi (Sadece Admin)
1. Admin olarak giriş yapın
2. "Yönetim Paneli" > "İçerik Yönetimi" bölümüne gidin
3. Yeni içerik oluşturun veya mevcut içerikleri düzenleyin

## Notlar

- Veritabanı dosyası (`server/database.sqlite`) ilk çalıştırmada otomatik oluşturulur
- JWT secret key production ortamında değiştirilmelidir
- SQLite veritabanı geliştirme için uygundur, production için PostgreSQL veya MySQL önerilir

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

