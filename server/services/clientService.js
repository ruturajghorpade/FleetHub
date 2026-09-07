// FleetHub – Client Service (Business Logic)
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import ApiError from '../utils/apiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { cleanObject } from '../utils/helpers.js';
import { ROLES } from '../utils/constants.js';

// ════════════════════════════════════════
// Create Client
// ════════════════════════════════════════
export const createClient = async (data, user) => {
  const userId = user?._id || user;

  // Check for duplicate companyCode
  const existingCode = await Client.findOne({ companyCode: data.companyCode.toUpperCase() });
  if (existingCode) {
    throw ApiError.conflict(`Company code "${data.companyCode}" is already in use`);
  }

  // Check for duplicate email
  const existingEmail = await Client.findOne({ email: data.email });
  if (existingEmail) {
    throw ApiError.conflict(`Email "${data.email}" is already registered to another client`);
  }

  const client = await Client.create({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  return client;
};

// ════════════════════════════════════════
// Get All Clients (with search, filter, sort, pagination)
// ════════════════════════════════════════
export const getClients = async (query, user) => {
  const { page, limit, skip, sort } = getPagination(query);

  // Build filter
  const filter = {};

  // ── Multi-Client Scoping ──────────────
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    filter._id = user.client;
  }

  // ── Text Search ──────────────────────
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { companyName: searchRegex },
      { companyCode: searchRegex },
      { email: searchRegex },
      { city: searchRegex },
    ];
  }

  // ── Field Filters ────────────────────
  if (query.status) filter.status = query.status;
  if (query.businessType) filter.businessType = query.businessType.toUpperCase();
  if (query.city) filter.city = new RegExp(`^${query.city}$`, 'i');
  if (query.state) filter.state = new RegExp(`^${query.state}$`, 'i');
  if (query.country) filter.country = new RegExp(`^${query.country}$`, 'i');
  if (query.subscriptionPlan) filter.subscriptionPlan = query.subscriptionPlan;

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean(),
    Client.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { clients, meta };
};

// ════════════════════════════════════════
// Get Client by ID
// ════════════════════════════════════════
export const getClientById = async (id, user) => {
  // Multi-client access check
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    if (id.toString() !== userClientId) {
      throw ApiError.forbidden('You do not have permission to access this client');
    }
  }

  const client = await Client.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  return client;
};

// ════════════════════════════════════════
// Update Client
// ════════════════════════════════════════
export const updateClient = async (id, data, user) => {
  const userId = user?._id || user;

  // Multi-client access check
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    if (id.toString() !== userClientId) {
      throw ApiError.forbidden('You do not have permission to update this client');
    }
    // Prevent client admin from altering subscription or system limits
    delete data.subscriptionPlan;
    delete data.subscriptionStartDate;
    delete data.subscriptionEndDate;
    delete data.maxBranches;
    delete data.maxVehicles;
    delete data.maxUsers;
    delete data.status;
  }

  const client = await Client.findById(id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Check duplicate companyCode (if being changed)
  if (data.companyCode && data.companyCode.toUpperCase() !== client.companyCode) {
    const existingCode = await Client.findOne({
      companyCode: data.companyCode.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingCode) {
      throw ApiError.conflict(`Company code "${data.companyCode}" is already in use`);
    }
  }

  // Check duplicate email (if being changed)
  if (data.email && data.email.toLowerCase() !== client.email) {
    const existingEmail = await Client.findOne({
      email: data.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingEmail) {
      throw ApiError.conflict(`Email "${data.email}" is already registered to another client`);
    }
  }

  // Strip undefined/null fields and apply audit trail
  const updatePayload = cleanObject({
    ...data,
    updatedBy: userId,
  });

  const updatedClient = await Client.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  return updatedClient;
};

// ════════════════════════════════════════
// Delete Client (Soft Delete with Orphan Branch Protection)
// ════════════════════════════════════════
export const deleteClient = async (id, user) => {
  const userId = user?._id || user;

  // Use select('+isDeleted') so we can see the field
  const client = await Client.findById(id).select('+isDeleted');

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  if (client.isDeleted) {
    throw ApiError.notFound('Client not found');
  }

  // Check if client has active branches (Requirement 28)
  const activeBranches = await Branch.countDocuments({
    client: id,
    isDeleted: { $ne: true },
  });
  if (activeBranches > 0) {
    throw ApiError.badRequest('Cannot delete client because it has active branches');
  }

  // Soft delete: mark as deleted, don't remove from DB
  client.isDeleted = true;
  client.deletedAt = new Date();
  client.updatedBy = userId;
  await client.save({ validateBeforeSave: false });

  return null;
};
