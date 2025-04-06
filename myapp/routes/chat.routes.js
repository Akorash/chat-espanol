const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all chat routes
router.use(authMiddleware);

// Send message route
router.post('/send', chatController.sendMessage);

// Get random phrase suggestion
router.get('/random-phrase', chatController.getRandomPhrase);

module.exports = router;