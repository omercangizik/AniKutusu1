# Anı Kutusu

NFC tabanlı anı paylaşım uygulaması. Bu uygulama, NFC etiketleri kullanarak kişisel anılarınızı paylaşmanıza olanak sağlar.

## Özellikler

- NFC etiketleri ile anı paylaşımı
- Fotoğraf yükleme ve görüntüleme
- Tarihli anı kayıtları
- Responsive tasarım
- Firebase entegrasyonu

## Teknolojiler

- Backend: Node.js, Express.js
- Frontend: React.js, Material-UI
- Veritabanı: Firebase Firestore
- Depolama: Firebase Storage
- Diğer: Multer, Axios, date-fns

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/anikutusu.git
cd anikutusu
```

2. Backend bağımlılıklarını yükleyin:
```bash
npm install
```

3. Frontend bağımlılıklarını yükleyin:
```bash
cd client
npm install
```

4. `.env` dosyasını oluşturun:
```env
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

5. Uygulamayı başlatın:

Backend için:
```bash
npm run dev
```

Frontend için (yeni bir terminal penceresinde):
```bash
cd client
npm start
```

## Kullanım

1. Uygulamaya giriş yapın
2. Yeni bir anı eklemek için "Yeni Anı Ekle" butonuna tıklayın
3. Başlık, açıklama ve tarih girin
4. İsterseniz bir fotoğraf yükleyin
5. Anıyı kaydedin
6. NFC etiketinize uygulama URL'sini yazın (örn: https://anikolyesi.com/ani/1234abcd)

## API Endpoints

- `POST /api/memories/:id` - Yeni anı ekle
- `GET /api/memories/:id` - Tüm anıları getir
- `GET /api/memories/:id/:memoryId` - Belirli bir anıyı getir
- `DELETE /api/memories/:id/:memoryId` - Anıyı sil

## Lisans

MIT 