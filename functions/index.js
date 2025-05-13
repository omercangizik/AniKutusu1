const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

// Express uygulamasını oluştur
const app = express();

// CORS ayarları
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase Admin SDK başlatma
initializeApp();

// Routes
const memoriesRouter = require('./routes/memories');
const authRouter = require('./routes/auth');

app.use('/api/memories', memoriesRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Bir şeyler yanlış gitti!' });
});

// Firebase Function olarak dışa aktar
exports.api = functions.https.onRequest(app); 