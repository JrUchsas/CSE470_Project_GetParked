const express = require('express');
const router = express.Router();
const {
  getPaymentInvoiceByReservationId,
  getAllPaymentInvoices,
  getPaymentInvoiceByNumber,
  getPaymentStatistics
} = require('../controllers/paymentInvoiceController');

// Get payment invoice by reservation history ID
router.get('/reservation/:reservationHistoryId', getPaymentInvoiceByReservationId);

// Get payment invoice by invoice number
router.get('/invoice/:invoiceNumber', getPaymentInvoiceByNumber);

// Get all payment invoices (admin only)
router.get('/', getAllPaymentInvoices);

// Get payment statistics (admin dashboard)
router.get('/statistics', getPaymentStatistics);

module.exports = router;
