import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // Increase timeout to 10 seconds (10000 ms)
});

// Add interceptor to include token in headers for future protected routes
API.interceptors.request.use((req) => {
  if (localStorage.getItem('user')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
  }
  return req;
});


// --- AUTH API CALLS (NEW) ---
export const loginUser = async (formData) => {
  const { data } = await API.post('/auth/login', formData);
  return data;
};

export const signupUser = async (formData) => {
  const { data } = await API.post('/auth/signup', formData);
  return data;
};


// --- SLOT API CALLS ---
export const getSlots = async () => {
  const { data } = await API.get('/slots');
  return data;
};

export const createSlot = async (slotData) => {
  const { data } = await API.post('/slots', slotData);
  return data;
};

export const updateSlot = async (id, slotData) => {
  const { data } = await API.put(`/slots/${id}`, slotData);
  return data;
};

export const deleteSlot = async (id) => {
  const { data } = await API.delete(`/slots/${id}`);
  return data;
};

// --- VEHICLE API CALLS ---
export const getVehiclesByOwner = async (ownerId) => {
  const { data } = await API.get(`/vehicles/owner/${ownerId}`);
  return data;
};

export const createVehicle = async (vehicleData) => {
  const { data } = await API.post('/vehicles', vehicleData);
  return data;
};

export const updateVehicle = async (id, vehicleData) => {
  const { data } = await API.put(`/vehicles/${id}`, vehicleData);
  return data;
};

export const deleteVehicle = async (id) => {
  const { data } = await API.delete(`/vehicles/${id}`);
  return data;
};

export const getAllVehicles = async () => {
  const { data } = await API.get('/vehicles');
  return data;
};

// --- PARKING API CALLS ---
export const checkIn = async (checkInData) => {
  const { data } = await API.post('/parking/check-in', checkInData);
  return data;
};

export const checkOut = async (id) => {
  const { data } = await API.put(`/parking/check-out/${id}`);
  return data;
};

export const checkOutBySlot = async (slotId) => {
  const { data } = await API.put(`/parking/check-out-by-slot/${slotId}`);
  return data;
};

export const getParkingSessionBySlot = async (slotId) => {
  const { data } = await API.get(`/parking/slot/${slotId}`);
  return data;
};

export const getParkingSessionsByUser = async (userId) => {
  const { data } = await API.get(`/parking/user/${userId}`);
  return data;
};

export const getAllParkingSessions = async () => {
  const { data } = await API.get('/parking/all');
  return data;
};

export const repairSlotStatuses = async () => {
  const { data } = await API.post('/parking/repair-slots');
  return data;
};

// --- RESERVATION HISTORY API CALLS ---
export const getReservationHistoryByUser = async (userId) => {
  const { data } = await API.get(`/reservation-history/user/${userId}`);
  return data;
};

export const createReservationHistory = async (historyData) => {
  const { data } = await API.post('/reservation-history', historyData);
  return data;
};

export const getAllReservationHistory = async () => {
  const { data } = await API.get('/reservation-history');
  return data;
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  const { data } = await API.put(`/reservation-history/${id}/payment`, { paymentStatus });
  return data;
};

export const getReservationHistoryById = async (id) => {
  const { data } = await API.get(`/reservation-history/${id}`);
  return data;
};

export const updateReservation = async (id, reservationData) => {
  const { data } = await API.put(`/reservation-history/${id}`, reservationData);
  return data;
};

export const deleteReservation = async (id) => {
  const { data } = await API.delete(`/reservation-history/${id}`);
  return data;
};

// --- PAYMENT INVOICE API CALLS ---
export const getPaymentInvoiceByReservationId = async (reservationHistoryId) => {
  const { data } = await API.get(`/payment-invoices/reservation/${reservationHistoryId}`);
  return data;
};

export const getAllPaymentInvoices = async () => {
  const { data } = await API.get('/payment-invoices');
  return data;
};

export const getPaymentInvoiceByNumber = async (invoiceNumber) => {
  const { data } = await API.get(`/payment-invoices/invoice/${invoiceNumber}`);
  return data;
};

export const getPaymentStatistics = async () => {
  const { data } = await API.get('/payment-invoices/statistics');
  return data;
};

// --- USER API CALLS ---
export const getAllUsers = async () => {
  const { data } = await API.get('/users');
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await API.put(`/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await API.delete(`/users/${id}`);
  return data;
};

// --- ADMIN API CALLS ---


// --- FEEDBACK API CALLS ---
export const leaveFeedback = async (feedbackData) => {
  const { data } = await API.post('/feedback', feedbackData);
  return data;
};

export const getAllFeedback = async () => {
  const { data } = await API.get('/feedback');
  return data;
};

// --- SHARE API CALLS ---
export const createShareRequest = async (requestData) => {
  const { data } = await API.post('/share/request', requestData);
  return data;
};

export const getShareRequests = async () => {
  const { data } = await API.get('/share/requests');
  return data;
};

export const getRelevantPendingShareRequest = async (slotId) => {
  const { data } = await API.get(`/share/requests/relevant/${slotId}`);
  return data;
};

export const acceptShareRequest = async (id) => {
  const { data } = await API.put(`/share/requests/${id}/accept`);
  return data;
};

export const acceptShareRequestAndCancelMyReservation = async (id) => {
  const { data } = await API.put(`/share/requests/${id}/accept-and-cancel`);
  return data;
};

export const acceptShareRequestAndEditMyReservation = async (id) => {
  const { data } = await API.put(`/share/requests/${id}/accept-and-edit`);
  return data;
};

export const rejectShareRequest = async (id, messageData) => {
  const { data } = await API.put(`/share/requests/${id}/reject`, messageData);
  return data;
};

export const sendShareRejectionMessage = async (id, messageData) => {
  const { data } = await API.post(`/share/requests/${id}/reject-message`, messageData);
  return data;
};

export const sendShareMessage = async (id, messageData) => {
  const { data } = await API.post(`/share/requests/${id}/message`, messageData);
  return data;
};

export const getShareMessages = async (id) => {
  const { data } = await API.get(`/share/requests/${id}/messages`);
  return data;
};