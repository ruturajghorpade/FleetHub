// FleetHub – Client Service
import api from '@/api/axios';

export const clientService = {
  /**
   * Get paginated clients with optional search/filter
   */
  getClients: async (params = {}) => {
    const res = await api.get('/clients', { params });
    return {
      clients: res.data?.clients || [],
      meta: res.meta || {},
    };
  },

  /**
   * Get single client by ID
   */
  getClientById: async (id) => {
    const res = await api.get(`/clients/${id}`);
    return res.data?.client;
  },

  /**
   * Create new client
   */
  createClient: async (clientData) => {
    const res = await api.post('/clients', clientData);
    return res.data?.client;
  },

  /**
   * Update client by ID
   */
  updateClient: async (id, clientData) => {
    const res = await api.put(`/clients/${id}`, clientData);
    return res.data?.client;
  },

  /**
   * Delete client by ID
   */
  deleteClient: async (id) => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
};

export default clientService;
