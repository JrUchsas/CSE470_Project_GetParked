const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const slotRoutes = require('./routes/slotRoutes');
const authRoutes = require('./routes/authRoutes'); // NEW
const vehicleRoutes = require('./routes/vehicleRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const reservationHistoryRoutes = require('./routes/reservationHistoryRoutes');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));