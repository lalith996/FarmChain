// Optional: OpenAI Integration for Advanced AI Responses
// Install: npm install openai

const logger = require('../utils/logger');

// Uncomment and configure when ready to use OpenAI
/*
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
*/

/**
 * Generate AI response using OpenAI GPT
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI generated response
 */
const generateOpenAIResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Uncomment when OpenAI is configured
    /*
    const systemPrompt = `You are FarmChain AI Assistant, a helpful chatbot for an agricultural blockchain platform. 
    
    Your role:
    - Help farmers list and sell their products
    - Explain blockchain verification and traceability
    - Guide users through the platform features
    - Answer questions about payments, orders, and KYC
    - Be friendly, professional, and concise
    
    Platform features:
    - Blockchain-verified product listings
    - Cryptocurrency payments (MATIC on Polygon)
    - Smart contract escrow
    - Supply chain tracking
    - Farmer verification and KYC
    - Real-time order tracking
    
    Always provide helpful, accurate information and guide users to the right resources.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    return completion.data.choices[0].message.content;
    */

    // Fallback response when OpenAI is not configured
    logger.info('OpenAI not configured, using fallback response');
    return null;
  } catch (error) {
    logger.error('OpenAI API error:', error);
    return null;
  }
};

/**
 * Analyze message sentiment
 * @param {string} message - Message to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
const analyzeSentiment = async (message) => {
  try {
    // Uncomment when OpenAI is configured
    /*
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following message. Respond with only: positive, negative, or neutral.'
        },
        { role: 'user', content: message }
      ],
      max_tokens: 10,
      temperature: 0.3,
    });

    const sentiment = completion.data.choices[0].message.content.toLowerCase().trim();
    return {
      sentiment,
      confidence: 0.8 // OpenAI doesn't provide confidence scores
    };
    */

    // Simple fallback sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'thanks', 'helpful', 'love'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'problem', 'issue'];

    const lowerMessage = message.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
    const hasNegative = negativeWords.some(word => lowerMessage.includes(word));

    let sentiment = 'neutral';
    if (hasPositive && !hasNegative) sentiment = 'positive';
    if (hasNegative && !hasPositive) sentiment = 'negative';

    return { sentiment, confidence: 0.6 };
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    return { sentiment: 'neutral', confidence: 0 };
  }
};

/**
 * Categorize user message
 * @param {string} message - Message to categorize
 * @returns {Promise<string>} - Category
 */
const categorizeMessage = async (message) => {
  const categories = {
    listing: ['list', 'product', 'sell', 'register', 'upload'],
    payment: ['payment', 'pay', 'crypto', 'wallet', 'money', 'matic'],
    blockchain: ['blockchain', 'verify', 'trace', 'track', 'transparent'],
    order: ['order', 'delivery', 'shipping', 'status', 'track'],
    kyc: ['kyc', 'verification', 'verify', 'account', 'documents'],
    pricing: ['price', 'fee', 'cost', 'plan', 'subscription'],
    support: ['help', 'support', 'contact', 'issue', 'problem'],
  };

  const lowerMessage = message.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }

  return 'general';
};

module.exports = {
  generateOpenAIResponse,
  analyzeSentiment,
  categorizeMessage,
};
