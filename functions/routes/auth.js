const express = require('express');
const router = express.Router();
const { getAuth } = require('firebase-admin/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateLogin = [
  body('email').trim().isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre gereklidir'),
];

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Firebase Authentication ile giriş yap
      const userRecord = await getAuth().getUserByEmail(email);
      
      // Custom token oluştur
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      res.json({ 
        token: customToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      });
    } catch (error) {
      console.error('Firebase auth error:', error);
      res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
  }
});

// Register route
router.post('/register', [
  body('email').trim().isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('displayName').trim().notEmpty().withMessage('İsim gereklidir'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName } = req.body;

    try {
      // Firebase Authentication ile kullanıcı oluştur
      const userRecord = await getAuth().createUser({
        email,
        password,
        displayName,
        emailVerified: false
      });

      // Custom token oluştur
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      res.status(201).json({
        token: customToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      });
    } catch (error) {
      console.error('Firebase auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda' });
      } else {
        res.status(500).json({ error: 'Kayıt olurken bir hata oluştu' });
      }
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt olurken bir hata oluştu' });
  }
});

module.exports = router; 