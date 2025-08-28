const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const slotRoutes = require('./routes/slotRoutes');
const authRoutes = require('./routes/authRoutes'); // NEW
const vehicleRoutes = require('./routes/vehicleRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const reservationHistoryRoutes = require('./routes/reservationHistoryRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentInvoiceRoutes = require('./routes/paymentInvoiceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { startScheduler } = require('./services/scheduler');
const feedbackRoutes = require('./routes/feedbackRoutes');
const shareRoutes = require('./routes/shareRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GetParked API with Prisma is running...');
});

// API Routes
app.use('/api/auth', authRoutes); // NEW
app.use('/api/slots', slotRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/reservation-history', reservationHistoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment-invoices', paymentInvoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/share', shareRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT);

startScheduler();