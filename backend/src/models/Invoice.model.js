const mongoose = require('mongoose');

/**
 * Invoice Model
 * Automated invoice generation for orders
 */
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  
  // Invoice items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  
  // Amounts
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    rate: Number,
    amount: Number
  },
  discount: {
    type: String,
    amount: Number
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Payment info
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'unpaid',
    index: true
  },
  paymentMethod: String,
  paidAmount: {
    type: Number,
    default: 0
  },
  paidAt: Date,
  
  // Addresses
  sellerAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String,
    email: String,
    taxId: String
  },
  buyerAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String,
    email: String
  },
  
  // Files
  pdfUrl: String,
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  
  // Notes
  notes: String,
  terms: String
}, {
  timestamps: true
});

// Auto-generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate due date (30 days from issue)
invoiceSchema.pre('save', function(next) {
  if (!this.dueDate) {
    this.dueDate = new Date(this.issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Check if overdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.paymentStatus === 'unpaid' && new Date() > this.dueDate;
});

module.exports = mongoose.model('Invoice', invoiceSchema);
