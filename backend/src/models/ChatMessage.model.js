const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for anonymous users
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['listing', 'payment', 'blockchain', 'order', 'kyc', 'pricing', 'support', 'general'],
      default: 'general',
    },
    helpful: {
      type: Boolean,
      default: null, // null = not rated, true = helpful, false = not helpful
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      responseTime: Number, // in milliseconds
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ category: 1 });

// Auto-delete old messages after 90 days
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
