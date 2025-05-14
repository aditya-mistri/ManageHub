const express = require('express');
const passport = require('passport');
const { ensureAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

router.get('/google', authController.googleAuth);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
    session: false
  }),
  authController.googleAuthCallback
);

router.get('/user', ensureAuth, authController.getCurrentUser);

router.post('/verify-token', authController.verifyToken);

router.get('/logout', ensureAuth, authController.logout);

router.post('/login', authController.loginWithEmail);

router.post('/register', authController.register);


module.exports = router;

