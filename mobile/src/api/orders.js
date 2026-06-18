import client from './client';

export const createCheckout = async (orderData) => {
  const response = await client.post('/orders/checkout', orderData);
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await client.get(`/orders/${orderId}`);
  return response.data;
};
