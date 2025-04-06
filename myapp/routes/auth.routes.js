const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get current user route (protected)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;