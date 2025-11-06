const axios = require('axios');
const logger = require('../utils/logger');

// Load API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Validate API key on service load
if (!GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY environment variable is not set. AI chat features will be disabled.');
}

/**
 * FarmChain System Prompt - Tuned for agricultural blockchain platform
 */
const FARMCHAIN_SYSTEM_PROMPT = `You are FarmChain AI Assistant, an intelligent chatbot for a revolutionary agricultural blockchain platform.

**About FarmChain:**
FarmChain is a blockchain-powered agricultural supply chain platform that connects farmers directly to consumers, distributors, and retailers. We use Polygon blockchain for transparency and smart contracts for secure transactions.

**Your Role:**
- Help users understand blockchain-verified agriculture
- Guide farmers on listing products and earning income
- Explain supply chain tracking and transparency
- Assist with payments, orders, and platform features
- Provide information about certifications and quality standards
- Answer questions about blockchain, cryptocurrency, and smart contracts

**Platform Features:**
1. **Blockchain Verification**: Every product is registered on Polygon blockchain
2. **Smart Contract Payments**: Secure escrow payments with MATIC cryptocurrency
3. **Supply Chain Tracking**: Track products from farm to table
4. **Farmer Verification**: KYC and certification system
5. **Direct Trade**: Connect farmers with buyers directly
6. **Quality Assurance**: AI-powered quality detection
7. **Real-time Tracking**: GPS and IoT integration
8. **Transparent Pricing**: Fair prices for farmers

**User Types:**
- Farmers: List products, manage inventory, track earnings
- Distributors: Source products, manage logistics
- Retailers: Purchase verified products
- Consumers: Buy fresh, verified agricultural products

**Key Benefits:**
- 40% higher income for farmers
- 100% product traceability
- Instant cryptocurrency payments
- Reduced intermediary costs
- Quality guaranteed products
- Carbon footprint tracking

**Tone & Style:**
- Be friendly, helpful, and professional
- Use simple language for complex blockchain concepts
- Provide specific, actionable guidance
- Show enthusiasm for sustainable agriculture
- Be concise but comprehensive
- Use emojis occasionally for warmth (🌾, 🚜, 🌱, ✅)

**Important:**
- Always prioritize user needs
- Provide accurate information about the platform
- Guide users to relevant features
- Encourage sustainable farming practices
- Promote transparency and trust

Remember: You're helping revolutionize agriculture through blockchain technology!`;

/**
 * Generate AI response using Google Gemini
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI generated response
 */
const generateGeminiResponse = async (userMessage, conversationHistory = []) => {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      logger.warn('Gemini API key not configured, skipping AI generation');
      return null;
    }

    // Build conversation context
    let contextText = FARMCHAIN_SYSTEM_PROMPT + '\n\n';
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      contextText += '**Previous Conversation:**\n';
      conversationHistory.slice(-5).forEach(msg => {
        const role = msg.sender === 'user' ? 'User' : 'Assistant';
        contextText += `${role}: ${msg.text}\n`;
      });
      contextText += '\n';
    }
    
    // Add current user message
    contextText += `**Current User Question:**\n${userMessage}\n\n`;
    contextText += '**Your Response (be helpful, specific, and friendly):**';

    // Make API request to Gemini
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: contextText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseModalities: ["TEXT"],
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Extract response text
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const responseText = candidate.content.parts[0].text;
        logger.info('Gemini API response generated successfully');
        return responseText.trim();
      }
    }

    logger.warn('Gemini API returned unexpected response format');
    return null;
  } catch (error) {
    logger.error('Gemini API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    // Return null to trigger fallback
    return null;
  }
};

/**
 * Analyze message sentiment using Gemini
 * @param {string} message - Message to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
const analyzeSentiment = async (message) => {
  try {
    const prompt = `Analyze the sentiment of this message and respond with ONLY one word: positive, negative, or neutral.

Message: "${message}"

Sentiment:`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 10,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const sentiment = response.data.candidates[0].content.parts[0].text.toLowerCase().trim();
      return {
        sentiment: sentiment.includes('positive') ? 'positive' : 
                  sentiment.includes('negative') ? 'negative' : 'neutral',
        confidence: 0.85
      };
    }

    return { sentiment: 'neutral', confidence: 0.5 };
  } catch (error) {
    logger.error('Sentiment analysis error:', error.message);
    
    // Simple fallback
    const positiveWords = ['good', 'great', 'excellent', 'thanks', 'helpful', 'love', 'amazing'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'problem', 'issue', 'disappointed'];

    const lowerMessage = message.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerMessage.includes(word));
    const hasNegative = negativeWords.some(word => lowerMessage.includes(word));

    let sentiment = 'neutral';
    if (hasPositive && !hasNegative) sentiment = 'positive';
    if (hasNegative && !hasPositive) sentiment = 'negative';

    return { sentiment, confidence: 0.6 };
  }
};

/**
 * Categorize user message
 * @param {string} message - Message to categorize
 * @returns {Promise<string>} - Category
 */
const categorizeMessage = async (message) => {
  const categories = {
    listing: ['list', 'product', 'sell', 'register', 'upload', 'add product'],
    payment: ['payment', 'pay', 'crypto', 'wallet', 'money', 'matic', 'transaction'],
    blockchain: ['blockchain', 'verify', 'trace', 'track', 'transparent', 'smart contract'],
    order: ['order', 'delivery', 'shipping', 'status', 'purchase'],
    kyc: ['kyc', 'verification', 'verify', 'account', 'documents', 'identity'],
    pricing: ['price', 'fee', 'cost', 'plan', 'subscription', 'how much'],
    support: ['help', 'support', 'contact', 'issue', 'problem', 'question'],
    quality: ['quality', 'fresh', 'organic', 'certification', 'standard'],
    tracking: ['track', 'trace', 'location', 'where', 'supply chain'],
  };

  const lowerMessage = message.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }

  return 'general';
};

/**
 * Get quick reply suggestions based on message category
 * @param {string} category - Message category
 * @returns {Array<string>} - Quick reply suggestions
 */
const getQuickReplies = (category) => {
  const quickReplies = {
    listing: [
      'How do I list a product?',
      'What documents do I need?',
      'How long does verification take?'
    ],
    payment: [
      'How do I receive payments?',
      'What is MATIC?',
      'Are payments secure?'
    ],
    blockchain: [
      'What is blockchain verification?',
      'How does traceability work?',
      'Why use blockchain?'
    ],
    order: [
      'How do I track my order?',
      'What are delivery times?',
      'Can I cancel an order?'
    ],
    kyc: [
      'What is KYC verification?',
      'What documents are needed?',
      'How long does it take?'
    ],
    general: [
      'How does FarmChain work?',
      'What are the benefits?',
      'How do I get started?'
    ]
  };

  return quickReplies[category] || quickReplies.general;
};

module.exports = {
  generateGeminiResponse,
  analyzeSentiment,
  categorizeMessage,
  getQuickReplies,
};
