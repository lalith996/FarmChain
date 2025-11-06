const mongoose = require('mongoose');

/**
 * Saved Search Model
 * Save search filters for quick access
 */
const savedSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  filters: {
    query: String,
    category: String,
    minPrice: Number,
    maxPrice: Number,
    qualityGrade: String,
    location: String,
    organic: Boolean,
    certified: Boolean,
    sortBy: String
  },
  notifyOnNewResults: {
    type: Boolean,
    default: false
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for user queries
savedSearchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
