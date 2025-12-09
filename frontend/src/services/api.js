import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,  
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchSales = async (params) => {
  const response = await api.get('/sales', { params });
  return response.data;
};

export const fetchMetrics = async (params) => {
  const response = await api.get('/sales/metrics', { params });
  return response.data;
};

export const fetchFilterOptions = async () => {
  const response = await api.get('/sales/filter-options');
  return response.data;
};

export default api;
