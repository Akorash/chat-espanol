const axios = require('axios');

// Ollama API URL (by default runs locally)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api';

// Generate chat response using Ollama
exports.generateResponse = async (message, conversationHistory) => {
  try {
    // Format conversation history
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // System instruction for Spanish learning
    const systemMessage = {
      role: 'system',
      content: `You are a friendly assistant Bunnyo helping beginners learn Spanish. 
      Follow these rules:
      1. ALWAYS respond in simple Spanish (A1 level).
      2. Use basic vocabulary and short sentences.
      3. Limit responses to 100 characters or less.
      4. Include English translations in parentheses when helpful.
      5. Be kind, patient and encouraging.`
    };

    // Create complete messages array
    const messages = [
      systemMessage,
      ...formattedHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call Ollama API (assuming you have a model like llama2 or mistral running)
    const response = await axios.post(`${OLLAMA_URL}/chat`, {
      model: 'mistral', // Use a model you've pulled to Ollama
      messages: messages,
      stream: false
    });

    // Extract the generated response
    const responseText = response.data.message.content;

    // Truncate if over 100 characters
    const finalResponse = responseText.length > 100
      ? responseText.substring(0, 97) + '...'
      : responseText;

    // Simple mood analysis
    const mood = this.simpleAnalyzeMood(finalResponse);

    return {
      content: finalResponse,
      mood
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    // Provide fallback response
    return {
      content: 'Lo siento, tengo un problema. ¿Puedes intentar de nuevo? (Sorry, I have a problem. Can you try again?)',
      mood: 'confused'
    };
  }
};

// Simple mood analysis without API
exports.simpleAnalyzeMood = (text) => {
  const textLower = text.toLowerCase();

  // Simple pattern matching for common Spanish emotion indicators
  if (textLower.includes('gracias') || textLower.includes('bueno') ||
      textLower.includes('bien') || textLower.includes('feliz') ||
      textLower.includes('excelente') || textLower.includes('perfecto')) {
    return 'happy';
  } else if (textLower.includes('lo siento') || textLower.includes('triste') ||
            textLower.includes('mal') || textLower.includes('difícil')) {
    return 'sad';
  } else if (textLower.includes('no entiendo') || textLower.includes('confuso') ||
            textLower.includes('¿qué?') || textLower.includes('¿cómo?')) {
    return 'confused';
  } else if (textLower.includes('jaja') || textLower.includes('divertido') ||
            textLower.includes('risa') || textLower.includes('gracioso')) {
    return 'laughing';
  } else if (textLower.includes('enfadado') || textLower.includes('molesto') ||
            textLower.includes('no me gusta')) {
    return 'angry';
  } else if (textLower.includes('gracias') || textLower.includes('amable') ||
            textLower.includes('me gusta')) {
    return 'blushing';
  }

  return 'neutral';
};

// More comprehensive mood analysis using Ollama
exports.analyzeMood = async (text) => {
  try {
    // Call Ollama API for mood analysis
    const response = await axios.post(`${OLLAMA_URL}/generate`, {
      model: 'mistral', // Use a model you've pulled to Ollama
      prompt: `Analyze the emotional tone of this Spanish text and classify it as exactly ONE of these emotions: happy, sad, angry, laughing, confused, blushing, neutral. Just return the single word for the emotion and nothing else.\n\nText: "${text}"`,
      stream: false,
      options: {
        temperature: 0.3,
        max_tokens: 10
      }
    });

    // Extract the mood
    const mood = response.data.response.trim().toLowerCase();

    // Valid moods
    const validMoods = ['happy', 'sad', 'angry', 'laughing', 'confused', 'blushing', 'neutral'];

    // Return the mood if valid, otherwise fall back to simple analysis
    return validMoods.includes(mood) ? mood : this.simpleAnalyzeMood(text);
  } catch (error) {
    console.error('Error analyzing mood with Ollama:', error);
    return this.simpleAnalyzeMood(text);
  }
};

// Get random Spanish phrase suggestion (unchanged)
exports.getRandomPhrase = () => {
  const phrases = [
    "¿Cómo estás? (How are you?)",
    "Buenos días (Good morning)",
    "Me llamo... (My name is...)",
    "Gracias (Thank you)",
    "Por favor (Please)",
    "¿Qué hora es? (What time is it?)",
    "Me gusta... (I like...)",
    "No entiendo (I don't understand)",
    "¿Puedes ayudarme? (Can you help me?)",
    "¿Dónde está...? (Where is...?)",
    // Add more phrases as needed
  ];

  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
};