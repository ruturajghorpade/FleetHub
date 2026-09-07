// FleetHub – Branch Service (Business Logic)
import Branch from '../models/Branch.js';
import Client from '../models/Client.js';
import Delivery from '../models/Delivery.js';
import ApiError from '../utils/apiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { cleanObject } from '../utils/helpers.js';
import { ROLES } from '../utils/constants.js';

// ════════════════════════════════════════
// Create Branch
// ════════════════════════════════════════
export const createBranch = async (data, user) => {
  const userId = user?._id || user;

  // Multi-client scoping check
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    if (data.client && data.client.toString() !== userClientId) {
      throw ApiError.forbidden('You can only create branches for your own restaurant');
    }
    data.client = userClientId;
  }

  // Verify the parent client exists
  const client = await Client.findById(data.client);
  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Check client's branch limit
  const branchCount = await Branch.countDocuments({ client: data.client, isDeleted: { $ne: true } });
  if (branchCount >= client.maxBranches) {
    throw ApiError.badRequest(
      `Branch limit reached. Client "${client.companyName}" allows a maximum of ${client.maxBranches} branches.`
    );
  }

  // Check for duplicate branchCode
  const existingCode = await Branch.findOne({ branchCode: data.branchCode.toUpperCase() });
  if (existingCode) {
    throw ApiError.conflict(`Branch code "${data.branchCode}" is already in use`);
  }

  const branch = await Branch.create({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  // Populate references before returning
  await branch.populate([
    { path: 'client', select: 'companyName companyCode' },
    { path: 'manager', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ]);

  return branch;
};

// ════════════════════════════════════════
// Get All Branches (search, filter, sort, pagination)
// ════════════════════════════════════════
export const getBranches = async (query, user) => {
  const { page, limit, skip, sort } = getPagination(query);

  // Build filter
  const filter = {};

  // ── Multi-Client Scoping ──────────────
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    filter.client = userClientId;
  } else if (query.client) {
    filter.client = query.client;
  }

  // ── Text Search ──────────────────────
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { branchName: searchRegex },
      { branchCode: searchRegex },
      { city: searchRegex },
      { state: searchRegex },
      { phone: searchRegex },
    ];
  }

  // ── Field Filters ────────────────────
  if (query.status) filter.status = query.status;
  if (query.city) filter.city = new RegExp(`^${query.city}$`, 'i');
  if (query.state) filter.state = new RegExp(`^${query.state}$`, 'i');

  const [branches, total] = await Promise.all([
    Branch.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('client', 'companyName companyCode')
      .populate('manager', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean(),
    Branch.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { branches, meta };
};

// ════════════════════════════════════════
// Get Branch by ID
// ════════════════════════════════════════
export const getBranchById = async (id, user) => {
  const branch = await Branch.findById(id)
    .populate('client', 'companyName companyCode email')
    .populate('manager', 'name email phone')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!branch) {
    throw ApiError.notFound('Branch not found');
  }

  // Multi-client data isolation check
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const branchClientId = branch.client?._id ? branch.client._id.toString() : branch.client?.toString();
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    if (branchClientId !== userClientId) {
      throw ApiError.forbidden('You do not have permission to access this branch');
    }
  }

  return branch;
};

// ════════════════════════════════════════
// Update Branch
// ════════════════════════════════════════
export const updateBranch = async (id, data, user) => {
  const userId = user?._id || user;

  const branch = await Branch.findById(id);

  if (!branch) {
    throw ApiError.notFound('Branch not found');
  }

  // Multi-client data isolation check
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const branchClientId = branch.client?._id ? branch.client._id.toString() : branch.client?.toString();
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    if (branchClientId !== userClientId) {
      throw ApiError.forbidden('You do not have permission to update this branch');
    }
    // Prevent client admin from transferring branch to another client
    if (data.client && data.client.toString() !== userClientId) {
      throw ApiError.forbidden('Cannot reassign branch to another client');
    }
  }

  // If changing client (super admin), verify the new client exists
  if (data.client && data.client.toString() !== branch.client.toString()) {
    const newClient = await Client.findById(data.client);
    if (!newClient) {
      throw ApiError.notFound('Target client not found');
    }
  }

  // Check duplicate branchCode (if being changed)
  if (data.branchCode && data.branchCode.toUpperCase() !== branch.branchCode) {
    const existingCode = await Branch.findOne({
      branchCode: data.branchCode.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingCode) {
      throw ApiError.conflict(`Branch code "${data.branchCode}" is already in use`);
    }
  }

  // Strip undefined/null fields and apply audit trail
  const updatePayload = cleanObject({
    ...data,
    updatedBy: userId,
  });

  const updatedBranch = await Branch.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .populate('client', 'companyName companyCode')
    .populate('manager', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  return updatedBranch;
};

// ════════════════════════════════════════
// Delete Branch (Soft Delete with Active Delivery Guard)
// ════════════════════════════════════════
export const deleteBranch = async (id, user) => {
  const userId = user?._id || user;

  const branch = await Branch.findById(id).select('+isDeleted');

  if (!branch || branch.isDeleted) {
    throw ApiError.notFound('Branch not found');
  }

  // Multi-client data isolation check
  if (user && user.role === ROLES.CLIENT_ADMIN) {
    const branchClientId = branch.client?._id ? branch.client._id.toString() : branch.client?.toString();
    const userClientId = user.client?._id ? user.client._id.toString() : user.client?.toString();
    if (branchClientId !== userClientId) {
      throw ApiError.forbidden('You do not have permission to delete this branch');
    }
  }

  // Check if branch has active deliveries
  const activeDeliveries = await Delivery.countDocuments({
    branch: id,
    status: { $in: ['pending', 'assigned', 'picked_up', 'out_for_delivery'] },
    isDeleted: { $ne: true },
  });
  if (activeDeliveries > 0) {
    throw ApiError.badRequest('Cannot delete branch because it has active deliveries');
  }

  // Soft delete
  branch.isDeleted = true;
  branch.deletedAt = new Date();
  branch.updatedBy = userId;
  await branch.save({ validateBeforeSave: false });

  return null;
};
