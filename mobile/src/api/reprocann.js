import client from './client';

export const submitReprocann = async (data) => {
  const response = await client.post('/reprocann', data);
  return response.data;
};
