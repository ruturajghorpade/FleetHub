// FleetHub – Branch Service (Business Logic)
import Branch from '../models/Branch.js';
import Client from '../models/Client.js';
import ApiError from '../utils/apiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { cleanObject } from '../utils/helpers.js';

// ════════════════════════════════════════
// Create Branch
// ════════════════════════════════════════
export const createBranch = async (data, userId) => {
  // Verify the parent client exists
  const client = await Client.findById(data.client);
  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Check client's branch limit
  const branchCount = await Branch.countDocuments({ client: data.client });
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
export const getBranches = async (query) => {
  const { page, limit, skip, sort } = getPagination(query);

  // Build filter
  const filter = {};

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
  if (query.client) filter.client = query.client;
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
export const getBranchById = async (id) => {
  const branch = await Branch.findById(id)
    .populate('client', 'companyName companyCode email')
    .populate('manager', 'name email phone')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!branch) {
    throw ApiError.notFound('Branch not found');
  }

  return branch;
};

// ════════════════════════════════════════
// Update Branch
// ════════════════════════════════════════
export const updateBranch = async (id, data, userId) => {
  const branch = await Branch.findById(id);

  if (!branch) {
    throw ApiError.notFound('Branch not found');
  }

  // If changing client, verify the new client exists
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
// Delete Branch (Soft Delete)
// ════════════════════════════════════════
export const deleteBranch = async (id, userId) => {
  const branch = await Branch.findById(id).select('+isDeleted');

  if (!branch) {
    throw ApiError.notFound('Branch not found');
  }

  if (branch.isDeleted) {
    throw ApiError.notFound('Branch not found');
  }

  // Soft delete
  branch.isDeleted = true;
  branch.deletedAt = new Date();
  branch.updatedBy = userId;
  await branch.save({ validateBeforeSave: false });

  return null;
};
