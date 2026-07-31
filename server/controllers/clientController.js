// FleetHub – Client Controller (Thin Layer)
import * as clientService from '../services/clientService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ════════════════════════════════════════
// POST /api/v1/clients
// ════════════════════════════════════════
export const createClient = asyncHandler(async (req, res) => {
  const client = await clientService.createClient(req.body, req.user._id);

  return ApiResponse.created(res, 'Client created successfully', { client });
});

// ════════════════════════════════════════
// GET /api/v1/clients
// ════════════════════════════════════════
export const getClients = asyncHandler(async (req, res) => {
  const { clients, meta } = await clientService.getClients(req.query);

  return ApiResponse.ok(res, 'Clients retrieved successfully', { clients }, meta);
});

// ════════════════════════════════════════
// GET /api/v1/clients/:id
// ════════════════════════════════════════
export const getClient = asyncHandler(async (req, res) => {
  const client = await clientService.getClientById(req.params.id);

  return ApiResponse.ok(res, 'Client retrieved successfully', { client });
});

// ════════════════════════════════════════
// PUT /api/v1/clients/:id
// ════════════════════════════════════════
export const updateClient = asyncHandler(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body, req.user._id);

  return ApiResponse.ok(res, 'Client updated successfully', { client });
});

// ════════════════════════════════════════
// DELETE /api/v1/clients/:id
// ════════════════════════════════════════
export const deleteClient = asyncHandler(async (req, res) => {
  await clientService.deleteClient(req.params.id, req.user._id);

  return ApiResponse.ok(res, 'Client deleted successfully');
});
