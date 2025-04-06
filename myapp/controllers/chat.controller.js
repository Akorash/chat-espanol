const chatService = require('../services/chat.service');
const Conversation = require('../models/conversation.model');

// Send a message and get a response
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.userId;

    // Input validation
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    if (message.length > 100) {
      return res.status(400).json({ message: 'Message exceeds 100 character limit' });
    }

    let conversation;

    // Find or create conversation
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      // Create new conversation
      conversation = new Conversation({
        userId,
        messages: []
      });
    }

    // Add user message to conversation
    conversation.messages.push({
      content: message,
      sender: 'user',
      timestamp: Date.now()
    });

    // Get conversation history for context
    const conversationHistory = conversation.messages.map(msg => ({
      content: msg.content,
      sender: msg.sender
    }));

    // Generate bot response
    const response = await chatService.generateResponse(message, conversationHistory);

    // Add bot response to conversation
    conversation.messages.push({
      content: response.content,
      sender: 'bot',
      mood: response.mood,
      timestamp: Date.now()
    });

    // Save conversation
    await conversation.save();

    res.status(200).json({
      message: 'Message sent successfully',
      response: {
        content: response.content,
        mood: response.mood,
        timestamp: new Date()
      },
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Error processing message',
      error: error.message
    });
  }
};

// Get a random Spanish phrase suggestion
exports.getRandomPhrase = (req, res) => {
  try {
    const phrase = chatService.getRandomPhrase();
    res.status(200).json({ phrase });
  } catch (error) {
    res.status(500).json({
      message: 'Error getting random phrase',
      error: error.message
    });
  }
};