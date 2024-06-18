import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' }
});

// API calls
export const getDeliveries = async () => {
  try {
    const response = await api.get('/delivery/');
    return response.data;
  } catch (error) {
    console.error('Error fetching Deliveries:', error);
    return [];
  }
};

export const getCentra = async () => {
  try {
    const response = await api.get('/centra/');
    return response.data;
  } catch (error) {
    console.error('Error fetching Centra:', error);
    return [];
  }
};

export const getBatches = async (centraId) => {
  try {
    const response = await api.get(`/batch?centra_id=${centraId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Batches:', error);
    return [];
  }
};

export const getBatchByPackage = async (packageId) => {
  try {
    const response = await api.get(`/batch/package/${packageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Batch by Package ID:', error);
    return null;
  }
};

export const getBatchById = async (batchId) => {
  try {
    const response = await api.get(`/batch/${batchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Batch by ID:', error);
    return null;
  }
};

export const updateDelivery = async (id, updatedData) => {
  try {
    const response = await api.put(`/delivery/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating Delivery:', error);
    return null;
  }
};

export const deleteDelivery = async (id) => {
  try {
    await api.delete(`/delivery/${id}`);
  } catch (error) {
    console.error('Error deleting Delivery:', error);
  }
};

export const addLeaves = async (weight) => {
  try {
    const response = await api.post('/add_leaves/', { weight });
    return response.data;
  } catch (error) {
    console.error('Error adding leaves:', error);
    return null;
  }
};

export const createBatch = async (rawWeight, centraId) => {
  try {
    const response = await api.post('/api/create_batch', {
      weight: rawWeight,
      centra_id: centraId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating batch:', error);
    return null;
  }
};

export const updateBatchWeightAndStatus = async (batchId, step, weight, inTime) => {
  try {
    const response = await api.put(`/batch/${batchId}`, {
      step: step,
      weight: weight,
      in_time: inTime
    });
    return response.data;
  } catch (error) {
    console.error('Error updating batch weight and status:', error);
    return null;
  }
};

export const getCentraName = async (centraId) => {
  try {
    const response = await api.get(`/centra_name/${centraId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CentraName:', error);
    return null;
  }
};

export const fetchWeeklyRawWeight = async () => {
  try {
    const response = await api.get('/weekly_raw_weight/');
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly raw weight:', error);
    return [];
  }
};

export const deleteBatch = async (batchId) => {
  try {
    await api.delete(`/batch/${batchId}`);
  } catch (error) {
    console.error('Error deleting batch', error);
  }
};

export const getCompletedBatches = async () => {
  try {
    const response = await api.get('/api/batches?status=Flour Leaves');
    return response.data;
  } catch (error) {
    console.error('Error fetching completed batches:', error);
    return [];
  }
};

export const createPackage = async ({ batchIds, centra_id, expeditionType, inDeliveryTime, outDeliveryTime, status }) => {
  try {
    const response = await api.post('/api/deliver', {
      batchIds,
      centra_id,
      expeditionType,
      inDeliveryTime,
      outDeliveryTime,
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
};

// Export the axios instance as the default export
export default api;
