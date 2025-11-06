const Invoice = require('../models/Invoice.model');
const Order = require('../models/Order.model');

/**
 * Generate invoice for an order
 */
exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      return res.json({
        success: true,
        data: existingInvoice,
        message: 'Invoice already exists'
      });
    }

    // Get order details
    const order = await Order.findById(orderId)
      .populate('seller', 'profile')
      .populate('customer', 'profile')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify user is seller or buyer
    if (order.seller._id.toString() !== userId.toString() && 
        order.customer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to generate invoice for this order'
      });
    }

    // Calculate amounts
    const items = order.items.map(item => ({
      productId: item.product._id,
      description: item.product.name,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.quantity * item.price
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount + (order.shippingCost || 0);

    // Create invoice
    const invoice = await Invoice.create({
      orderId: order._id,
      sellerId: order.seller._id,
      buyerId: order.customer._id,
      items,
      subtotal,
      tax: {
        rate: taxRate,
        amount: taxAmount
      },
      shippingCost: order.shippingCost || 0,
      total,
      currency: 'INR',
      paymentStatus: order.paymentStatus === 'completed' ? 'paid' : 'unpaid',
      paymentMethod: order.paymentMethod,
      paidAmount: order.paymentStatus === 'completed' ? total : 0,
      paidAt: order.paymentStatus === 'completed' ? order.paidAt : null,
      sellerAddress: {
        name: order.seller.profile.name,
        address: order.seller.profile.location?.address,
        city: order.seller.profile.location?.city,
        state: order.seller.profile.location?.state,
        country: order.seller.profile.location?.country,
        pincode: order.seller.profile.location?.pincode,
        phone: order.seller.profile.phone,
        email: order.seller.profile.email,
        taxId: order.seller.profile.taxId
      },
      buyerAddress: {
        name: order.customer.profile.name,
        address: order.shippingAddress?.address,
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        country: order.shippingAddress?.country,
        pincode: order.shippingAddress?.pincode,
        phone: order.customer.profile.phone,
        email: order.customer.profile.email
      },
      terms: 'Payment due within 30 days. Late payments may incur additional charges.'
    });

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice generated successfully'
    });
  } catch (error) {
    logger.error('Error generating invoice:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to generate invoice'
    });
  }
};

/**
 * Get invoice by ID
 */
exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const invoice = await Invoice.findById(id)
      .populate('orderId', 'orderNumber')
      .populate('sellerId', 'profile.name')
      .populate('buyerId', 'profile.name');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Verify user is seller or buyer
    if (invoice.sellerId._id.toString() !== userId.toString() && 
        invoice.buyerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error fetching invoice:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
};

/**
 * Get invoice by order ID
 */
exports.getInvoiceByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const invoice = await Invoice.findOne({ orderId })
      .populate('orderId', 'orderNumber')
      .populate('sellerId', 'profile.name')
      .populate('buyerId', 'profile.name');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found for this order'
      });
    }

    // Verify user is seller or buyer
    if (invoice.sellerId._id.toString() !== userId.toString() && 
        invoice.buyerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error fetching invoice:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
};

/**
 * Get all invoices for user
 */
exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all', status, page = 1, limit = 20 } = req.query;

    const query = {};
    
    // Filter by user type
    if (type === 'sales') {
      query.sellerId = userId;
    } else if (type === 'purchases') {
      query.buyerId = userId;
    } else {
      query.$or = [{ sellerId: userId }, { buyerId: userId }];
    }

    // Filter by status
    if (status) {
      query.paymentStatus = status;
    }

    const invoices = await Invoice.find(query)
      .populate('orderId', 'orderNumber')
      .populate('sellerId', 'profile.name')
      .populate('buyerId', 'profile.name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching invoices:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
};

/**
 * Update payment status
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paidAmount, paymentMethod } = req.body;
    const userId = req.user._id;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Only seller can update payment status
    if (invoice.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this invoice'
      });
    }

    invoice.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) invoice.paidAmount = paidAmount;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentStatus === 'paid') invoice.paidAt = new Date();

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating payment status:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status'
    });
  }
};

/**
 * Generate PDF (placeholder - would use pdfkit or similar)
 */
exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const invoice = await Invoice.findById(id)
      .populate('orderId')
      .populate('sellerId', 'profile')
      .populate('buyerId', 'profile');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Verify user is seller or buyer
    if (invoice.sellerId._id.toString() !== userId.toString() && 
        invoice.buyerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to download this invoice'
      });
    }

    // TODO: Implement PDF generation with pdfkit
    // For now, return invoice data in JSON format
    res.json({
      success: true,
      data: invoice,
      message: 'PDF generation not yet implemented. Use this data to generate PDF on frontend.'
    });
  } catch (error) {
    logger.error('Error generating PDF:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF'
    });
  }
};
