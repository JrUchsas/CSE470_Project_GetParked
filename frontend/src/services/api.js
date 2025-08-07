import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

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