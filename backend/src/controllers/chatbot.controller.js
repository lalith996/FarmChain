const ChatMessage = require('../models/ChatMessage.model');
const logger = require('../utils/logger');
const { generateGeminiResponse, analyzeSentiment, categorizeMessage, getQuickReplies } = require('../services/gemini.service');

// AI Response Generator using Gemini API
const generateAIResponse = async (message, conversationHistory = []) => {
  // Try Gemini API first
  const geminiResponse = await generateGeminiResponse(message, conversationHistory);
  
  if (geminiResponse) {
    return geminiResponse;
  }
  
  // Fallback to rule-based responses if Gemini fails
  logger.warn('Gemini API failed, using fallback responses');
  return generateFallbackResponse(message);
};

// Fallback response generator
const generateFallbackResponse = async (message) => {
  const lowerMessage = message.toLowerCase();

  // Knowledge base responses
  const responses = {
    listing: {
      keywords: ['list', 'product', 'sell', 'register'],
      response: `To list your products on FarmChain:

1. Navigate to 'Register Product' page
2. Fill in product details:
   • Name and description
   • Category and quantity
   • Price and quality grade
3. Upload product images
4. Add certifications (optional)
5. Submit for blockchain registration

Your product will be verified and listed within 24 hours! 🌾

Need help with a specific step?`,
    },
    payment: {
      keywords: ['payment', 'pay', 'crypto', 'wallet', 'money'],
      response: `FarmChain Payment System:

💰 Accepted Currency: MATIC (Polygon Network)
🔒 Security: Smart contract escrow
⚡ Speed: Instant transactions
💸 Fees: Minimal gas costs

How it works:
1. Buyer pays → Funds held in escrow
2. Seller ships → Updates status
3. Buyer confirms → Funds released automatically

Your payments are secure and transparent! Need help setting up your wallet?`,
    },
    blockchain: {
      keywords: ['blockchain', 'verify', 'trace', 'track', 'transparent'],
      response: `Blockchain Verification Benefits:

✅ Product Authenticity: Every product has a unique blockchain ID
✅ Supply Chain Transparency: Track from farm to table
✅ Immutable Records: Cannot be altered or faked
✅ Farmer Verification: All farmers are KYC verified

Each transaction is recorded on Polygon blockchain, ensuring complete transparency and trust!

Want to verify a specific product?`,
    },
    order: {
      keywords: ['order', 'track', 'delivery', 'shipping', 'status'],
      response: `Order Tracking:

📦 Track your order:
1. Go to 'My Orders' page
2. Click on your order ID
3. View real-time status updates
4. See blockchain-verified milestones

Order statuses:
• Pending → Confirmed → Shipped → Delivered

You'll receive notifications at each step! Need help with a specific order?`,
    },
    kyc: {
      keywords: ['kyc', 'verification', 'verify', 'account', 'documents'],
      response: `KYC Verification Process:

📋 Required Documents:
• Identity proof (Aadhar/PAN)
• Address proof
• Business registration (for farmers)

⏱️ Timeline: 24-48 hours
✓ Benefits: Verified badge, priority support, better visibility

Steps:
1. Upload documents
2. Fill business details
3. Wait for admin approval
4. Get verified!

Need help uploading documents?`,
    },
    pricing: {
      keywords: ['price', 'fee', 'cost', 'plan', 'subscription'],
      response: `FarmChain Pricing Plans:

🆓 Basic (Free):
• List up to 10 products
• 2% transaction fee
• Basic support

💼 Professional (₹999/month):
• Unlimited listings
• 1.5% transaction fee
• Priority support
• Featured listings

🏢 Enterprise (Custom):
• Everything in Professional
• 1% transaction fee
• Dedicated account manager
• API access

No hidden charges! Which plan interests you?`,
    },
    support: {
      keywords: ['help', 'support', 'contact', 'issue', 'problem'],
      response: `FarmChain Support:

📧 Email: support@farmchain.com
📞 Phone: +91 1234 567 890
💬 Live Chat: Right here!
📚 Help Center: /help
⏰ Hours: 24/7 support

Common issues:
• Account problems
• Payment issues
• Technical difficulties
• Product listing help

What specific issue can I help you with?`,
    },
  };

  // Find matching response
  for (const [key, data] of Object.entries(responses)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return data.response;
    }
  }

  // Default response
  return `I understand you're asking about: "${message}"

I'm here to help! Here are some things I can assist with:

🌾 Product Listings
💰 Payments & Pricing
🔗 Blockchain Verification
📦 Order Tracking
✓ KYC Verification
📞 Support & Contact

Could you please rephrase your question or choose one of the topics above?`;
};

// Send message and get AI response
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Categorize message
    const category = await categorizeMessage(message);
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(message);

    // Get conversation history from database if user is authenticated
    let dbHistory = [];
    if (req.user && sessionId) {
      dbHistory = await ChatMessage.find({
        user: req.user._id,
        sessionId: sessionId
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
      // Format history for AI
      dbHistory = dbHistory.reverse().map(msg => ({
        sender: 'user',
        text: msg.userMessage
      })).concat(dbHistory.reverse().map(msg => ({
        sender: 'bot',
        text: msg.botResponse
      })));
    }

    // Merge with client-side history
    const fullHistory = [...dbHistory, ...conversationHistory];

    // Generate AI response with conversation context
    const aiResponse = await generateAIResponse(message, fullHistory);

    // Get quick reply suggestions
    const quickReplies = getQuickReplies(category);

    // Save conversation (if user is authenticated)
    if (req.user) {
      await ChatMessage.create({
        user: req.user._id,
        sessionId: sessionId || 'anonymous',
        userMessage: message,
        botResponse: aiResponse,
        category,
        sentiment: sentiment.sentiment,
      });
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        category,
        sentiment,
        quickReplies,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    logger.error('Chatbot message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: 'Sorry, I encountered an error. Please try again.',
    });
  }
};

// Get suggested questions
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      { id: 1, text: 'How do I list my products?', category: 'listing' },
      { id: 2, text: 'What payment methods are supported?', category: 'payment' },
      { id: 3, text: 'How does blockchain verification work?', category: 'blockchain' },
      { id: 4, text: 'How can I track my order?', category: 'order' },
      { id: 5, text: 'What is KYC verification?', category: 'kyc' },
      { id: 6, text: 'What are the pricing plans?', category: 'pricing' },
    ];

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
    });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatMessage.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat history',
    });
  }
};

// Clear chat history
exports.clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    logger.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history',
    });
  }
};
