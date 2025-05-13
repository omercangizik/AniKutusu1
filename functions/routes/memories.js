const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { body, validationResult } = require('express-validator');

const db = getFirestore();
const bucket = getStorage().bucket();

// Validation middleware
const validateMemory = [
  body('title').trim().notEmpty().withMessage('Başlık gereklidir'),
  body('description').trim().notEmpty().withMessage('Açıklama gereklidir'),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz'),
];

// GET /api/memories/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('memories').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Eğer belge yoksa, yeni bir belge oluştur
      await docRef.set({
        memories: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return res.json({ memories: [] });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Anılar getirilirken bir hata oluştu' });
  }
});

// POST /api/memories/:id
router.post('/:id', validateMemory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, date } = req.body;
    const file = req.files?.photo;

    if (!file) {
      return res.status(400).json({ error: 'Fotoğraf gereklidir' });
    }

    // Fotoğrafı Firebase Storage'a yükle
    const memoryId = Date.now().toString();
    const fileBuffer = file.data;
    const filePath = `memories/${id}/${memoryId}`;
    const fileUpload = bucket.file(filePath);

    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype
      }
    });

    // Dosyayı herkese açık yap
    await fileUpload.makePublic();

    // Fotoğraf URL'sini oluştur
    const photoUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Firestore'a kaydet
    const docRef = db.collection('memories').doc(id);
    const doc = await docRef.get();

    const memory = {
      id: memoryId,
      title,
      description,
      date: new Date(date),
      photoUrl,
      createdAt: new Date()
    };

    if (!doc.exists) {
      await docRef.set({
        memories: [memory],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await docRef.update({
        memories: [...doc.data().memories, memory],
        updatedAt: new Date()
      });
    }

    res.status(201).json(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Anı oluşturulurken bir hata oluştu' });
  }
});

// DELETE /api/memories/:id/:memoryId
router.delete('/:id/:memoryId', async (req, res) => {
  try {
    const { id, memoryId } = req.params;
    const docRef = db.collection('memories').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Anı bulunamadı' });
    }

    const memories = doc.data().memories;
    const memoryIndex = memories.findIndex(m => m.id === memoryId);

    if (memoryIndex === -1) {
      return res.status(404).json({ error: 'Anı bulunamadı' });
    }

    // Fotoğrafı Storage'dan sil
    const filePath = `memories/${id}/${memoryId}`;
    await bucket.file(filePath).delete();

    // Firestore'dan sil
    memories.splice(memoryIndex, 1);
    await docRef.update({
      memories,
      updatedAt: new Date()
    });

    res.json({ message: 'Anı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Anı silinirken bir hata oluştu' });
  }
});

module.exports = router; 