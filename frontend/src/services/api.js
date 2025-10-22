const BASE_URL = 'http://localhost:5000/api';

const api = async (endpoint, options = {}) => {
  const { body, ...customConfig } = options;
  const token = localStorage.getItem('token');

  const headers = {};
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default api;
