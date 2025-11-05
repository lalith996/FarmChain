const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  role: {
    type: String,
    enum: ['farmer', 'distributor', 'retailer', 'consumer', 'admin'],
    required: true,
    index: true
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: String,
    location: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      city: String,
      state: String,
      country: String,
      pincode: String
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    documents: [{
      type: {
        type: String,
        enum: ['id_proof', 'address_proof', 'license', 'certificate']
      },
      ipfsHash: String,
      uploadDate: Date
    }]
  },
  businessInfo: {
    registrationNumber: String,
    farmSize: Number,
    licenseNumber: String,
    taxId: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }]
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });

// Methods
userSchema.methods.updateRating = async function(newRating) {
  this.rating.count += 1;
  this.rating.average = ((this.rating.average * (this.rating.count - 1)) + newRating) / this.rating.count;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
