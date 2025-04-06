const Conversation = require('../models/conversation.model');

// Get all conversations for a user
exports.getAllConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find conversations with pagination
    const conversations = await Conversation.find({ userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Conversation.countDocuments({ userId });

    res.status(200).json({
      conversations,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get a single conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const conversation = new Conversation({
      userId,
      title: title || undefined,
      messages: []
    });

    await conversation.save();

    res.status(201).json({
      message: 'Conversation created successfully',
      conversationId: conversation._id
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await Conversation.deleteOne({
      _id: id,
      userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};

// Update conversation title
exports.updateConversationTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.status(200).json({
      message: 'Conversation title updated successfully',
      conversation
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating conversation title',
      error: error.message
    });
  }
};

// Clear conversation messages
exports.clearConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.messages = [];
    await conversation.save();

    res.status(200).json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error clearing conversation',
      error: error.message
    });
  }
};