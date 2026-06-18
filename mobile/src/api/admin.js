import client from './client';

export const adminLogin = async (email, password) => {
  const response = await client.post('/admin/login', { email, password });
  return response.data;
};

export const getAdminOrders = async (token) => {
  const response = await client.get('/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createProduct = async (data, token) => {
  const response = await client.post('/admin/products', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProduct = async (id, data, token) => {
  const response = await client.put(`/admin/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const response = await client.delete(`/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
