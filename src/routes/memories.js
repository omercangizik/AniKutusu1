const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { body, param, validationResult } = require('express-validator');

const db = getFirestore();
const bucket = getStorage().bucket();

// Multer configuration for memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Validation middleware
const validateMemory = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Başlık 1-100 karakter arasında olmalıdır'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Açıklama 1-500 karakter arasında olmalıdır'),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz'),
];

// Create new memory
router.post('/:id', upload.single('photo'), validateMemory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, date } = req.body;
    const memoryId = uuidv4();

    let photoUrl = null;
    if (req.file) {
      const file = bucket.file(`memories/${id}/${memoryId}`);
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      // Make the file publicly accessible
      await file.makePublic();
      // Get the public URL
      photoUrl = `https://storage.googleapis.com/${bucket.name}/memories/${id}/${memoryId}`;
    }

    const memoryRef = db.collection('memories').doc(id);
    const memory = {
      memoryId,
      title,
      description,
      date: new Date(date),
      photoUrl,
      createdAt: new Date(),
    };

    await memoryRef.set({
      items: [...(await memoryRef.get()).data()?.items || [], memory],
    }, { merge: true });

    res.status(201).json(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Anı oluşturulurken bir hata oluştu' });
  }
});

// Get all memories for a specific ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const memoryRef = db.collection('memories').doc(id);
    const memoryDoc = await memoryRef.get();
    
    if (!memoryDoc.exists) {
      // Create the document with an empty items array
      await memoryRef.set({ items: [] });
      return res.json([]);
    }

    res.json(memoryDoc.data().items || []);
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Anılar getirilirken bir hata oluştu' });
  }
});

// Get specific memory
router.get('/:id/:memoryId', async (req, res) => {
  try {
    const { id, memoryId } = req.params;
    const memoryDoc = await db.collection('memories').doc(id).get();
    
    if (!memoryDoc.exists) {
      return res.status(404).json({ error: 'Anı bulunamadı' });
    }

    const memory = memoryDoc.data().items.find(item => item.memoryId === memoryId);
    if (!memory) {
      return res.status(404).json({ error: 'Anı bulunamadı' });
    }

    res.json(memory);
  } catch (error) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: 'Anı getirilirken bir hata oluştu' });
  }
});

// Delete memory
router.delete('/:id/:memoryId', async (req, res) => {
  try {
    const { id, memoryId } = req.params;
    const memoryRef = db.collection('memories').doc(id);
    const memoryDoc = await memoryRef.get();

    if (!memoryDoc.exists) {
      return res.status(404).json({ error: 'Anı bulunamadı' });
    }

    const memories = memoryDoc.data().items || [];
    const memory = memories.find(item => item.memoryId === memoryId);

    if (!memory) {
      return res.status(404).json({ error: 'Anı bulunamadı' });
    }

    // Delete photo from storage if exists
    if (memory.photoUrl) {
      const photoPath = `memories/${id}/${memoryId}`;
      await bucket.file(photoPath).delete();
    }

    // Remove memory from array
    const updatedMemories = memories.filter(item => item.memoryId !== memoryId);
    await memoryRef.update({ items: updatedMemories });

    res.json({ message: 'Anı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Anı silinirken bir hata oluştu' });
  }
});

module.exports = router; 