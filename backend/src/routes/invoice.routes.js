const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

/**
 * Invoice Routes with RBAC
 */

// Generate invoice for order (sellers/buyers)
router.post('/generate', 
  authenticate,
  invoiceController.generateInvoice
);

// Get user's invoices (all authenticated users)
router.get('/', 
  authenticate,
  invoiceController.getUserInvoices
);

// Get invoice by ID (sellers/buyers)
router.get('/:id', 
  authenticate,
  invoiceController.getInvoice
);

// Get invoice by order ID (sellers/buyers)
router.get('/order/:orderId', 
  authenticate,
  invoiceController.getInvoiceByOrder
);

// Update payment status (sellers only)
router.patch('/:id/payment', 
  authenticate,
  requireRole('FARMER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN'),
  invoiceController.updatePaymentStatus
);

// Generate PDF (sellers/buyers)
router.get('/:id/pdf', 
  authenticate,
  invoiceController.generatePDF
);

module.exports = router;
