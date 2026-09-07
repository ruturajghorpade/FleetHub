// FleetHub – Branch Service
import api from '@/api/axios';

export const branchService = {
  /**
   * Get all branches with optional filtering (client, status, search)
   */
  getBranches: async (params = {}) => {
    const res = await api.get('/branches', { params });
    return {
      branches: res.data?.branches || [],
      meta: res.meta || {},
    };
  },

  /**
   * Get branch by ID
   */
  getBranchById: async (id) => {
    const res = await api.get(`/branches/${id}`);
    return res.data?.branch;
  },

  /**
   * Create new branch
   */
  createBranch: async (branchData) => {
    const res = await api.post('/branches', branchData);
    return res.data?.branch;
  },

  /**
   * Update branch
   */
  updateBranch: async (id, branchData) => {
    const res = await api.put(`/branches/${id}`, branchData);
    return res.data?.branch;
  },

  /**
   * Delete branch
   */
  deleteBranch: async (id) => {
    const res = await api.delete(`/branches/${id}`);
    return res.data;
  },
};

export default branchService;
