import client from './client';

export const getCategories = async () => {
  const response = await client.get('/categories');
  return response.data;
};

export const getProducts = async (params = {}) => {
  const response = await client.get('/products', { params });
  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await client.get(`/products/${slug}`);
  return response.data;
};
