const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all conversation routes
router.use(authMiddleware);

// Get all conversations for a user
router.get('/', conversationController.getAllConversations);

// Get a single conversation by ID
router.get('/:id', conversationController.getConversationById);

// Create a new conversation
router.post('/', conversationController.createConversation);

// Delete a conversation
router.delete('/:id', conversationController.deleteConversation);

// Update conversation title
router.patch('/:id/title', conversationController.updateConversationTitle);

// Clear conversation messages
router.post('/:id/clear', conversationController.clearConversation);

module.exports = router;