// FleetHub – User Service (Business Logic)
import User from '../models/User.js';
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import ApiError from '../utils/apiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { cleanObject } from '../utils/helpers.js';
import { ROLES } from '../utils/constants.js';

// ════════════════════════════════════════
// Role hierarchy (higher index = higher privilege)
// ════════════════════════════════════════
const ROLE_HIERARCHY = [
  ROLES.DRIVER,
  ROLES.DISPATCHER,
  ROLES.BRANCH_MANAGER,
  ROLES.CLIENT_ADMIN,
  ROLES.SUPER_ADMIN,
];

const getRoleLevel = (role) => ROLE_HIERARCHY.indexOf(role);

// ════════════════════════════════════════
// Internal helpers
// ════════════════════════════════════════

/**
 * Enforce scope-based access: ensures the requesting user has visibility
 * over the target user based on role hierarchy and org scoping.
 */
const enforceScopeAccess = (requestingUser, targetUser, action = 'manage') => {
  const reqRole = requestingUser.role;

  // SUPER_ADMIN → unrestricted
  if (reqRole === ROLES.SUPER_ADMIN) return;

  // Nobody below SUPER_ADMIN can manage a SUPER_ADMIN
  if (targetUser.role === ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('You do not have permission to manage a Super Admin');
  }

  // CLIENT_ADMIN → target must belong to the same client
  if (reqRole === ROLES.CLIENT_ADMIN) {
    const reqClient = requestingUser.client?.toString();
    const targetClient = targetUser.client?.toString();
    if (!reqClient || reqClient !== targetClient) {
      throw ApiError.forbidden('You can only manage users within your own client');
    }
    return;
  }

  // BRANCH_MANAGER → target must belong to the same branch
  if (reqRole === ROLES.BRANCH_MANAGER) {
    const reqBranch = requestingUser.branch?.toString();
    const targetBranch = targetUser.branch?.toString();
    if (!reqBranch || reqBranch !== targetBranch) {
      throw ApiError.forbidden('You can only manage users within your own branch');
    }
    return;
  }

  // DISPATCHER → read-only; block any write action
  if (reqRole === ROLES.DISPATCHER) {
    if (action !== 'read') {
      throw ApiError.forbidden('Dispatchers have read-only access');
    }
    // Scope to same client
    const reqClient = requestingUser.client?.toString();
    const targetClient = targetUser.client?.toString();
    if (!reqClient || reqClient !== targetClient) {
      throw ApiError.forbidden('You can only view users within your own client');
    }
    return;
  }

  // DRIVER → can only view own profile
  if (reqRole === ROLES.DRIVER) {
    if (requestingUser._id.toString() !== targetUser._id.toString()) {
      throw ApiError.forbidden('Drivers can only view their own profile');
    }
    return;
  }

  throw ApiError.forbidden('Insufficient permissions');
};

/**
 * Build a scoped filter based on the requesting user's role.
 * Limits the result set to what the user is allowed to see.
 */
const buildScopeFilter = (requestingUser) => {
  const filter = {};
  const role = requestingUser.role;

  if (role === ROLES.SUPER_ADMIN) {
    // No scope restriction
    return filter;
  }

  if (role === ROLES.CLIENT_ADMIN || role === ROLES.DISPATCHER) {
    // Scoped to own client
    filter.client = requestingUser.client;
    return filter;
  }

  if (role === ROLES.BRANCH_MANAGER) {
    // Scoped to own branch
    filter.branch = requestingUser.branch;
    return filter;
  }

  if (role === ROLES.DRIVER) {
    // Only own profile
    filter._id = requestingUser._id;
    return filter;
  }

  return filter;
};

// ════════════════════════════════════════
// Create User
// ════════════════════════════════════════
export const createUser = async (data, requestingUser) => {
  const reqRole = requestingUser.role;

  // ── Role-based creation restrictions ──
  if (reqRole === ROLES.BRANCH_MANAGER) {
    // Branch managers can only create DRIVER and DISPATCHER
    if (![ROLES.DRIVER, ROLES.DISPATCHER].includes(data.role)) {
      throw ApiError.forbidden('Branch Managers can only create Drivers and Dispatchers');
    }
    // Auto-scope to own client and branch
    data.client = requestingUser.client;
    data.branch = requestingUser.branch;
  }

  if (reqRole === ROLES.CLIENT_ADMIN) {
    // CLIENT_ADMIN cannot create SUPER_ADMIN
    if (data.role === ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden('Client Admins cannot create Super Admin users');
    }
    // Auto-scope to own client
    data.client = requestingUser.client;
  }

  // ── Check email uniqueness ──
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw ApiError.conflict(`Email "${data.email}" is already in use`);
  }

  // ── Validate client exists (if provided) ──
  if (data.client) {
    const clientExists = await Client.findById(data.client);
    if (!clientExists) {
      throw ApiError.notFound('Specified client does not exist');
    }
  }

  // ── Validate branch exists and belongs to client (if provided) ──
  if (data.branch) {
    const branch = await Branch.findById(data.branch);
    if (!branch) {
      throw ApiError.notFound('Specified branch does not exist');
    }
    if (data.client && branch.client.toString() !== data.client.toString()) {
      throw ApiError.badRequest('Branch does not belong to the specified client');
    }
  }

  // ── Create user (password hashed by pre-save hook) ──
  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    password: data.password,
    role: data.role,
    client: data.client || null,
    branch: data.branch || null,
  });

  return user;
};

// ════════════════════════════════════════
// Get All Users (search, filter, sort, pagination)
// ════════════════════════════════════════
export const getUsers = async (query, requestingUser) => {
  const { page, limit, skip, sort } = getPagination(query);

  // Start with scope-based filter
  const filter = buildScopeFilter(requestingUser);

  // ── Text Search ──────────────────────
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  // ── Field Filters ────────────────────
  if (query.role) filter.role = query.role;
  if (query.client) filter.client = query.client;
  if (query.branch) filter.branch = query.branch;
  if (query.status !== undefined) {
    filter.isActive = query.status === 'active';
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('client', 'companyName companyCode')
      .populate('branch', 'branchName branchCode')
      .lean(),
    User.countDocuments(filter),
  ]);

  const meta = getPaginationMeta(total, page, limit);

  return { users, meta };
};

// ════════════════════════════════════════
// Get User by ID
// ════════════════════════════════════════
export const getUserById = async (id, requestingUser) => {
  const user = await User.findById(id)
    .populate('client', 'companyName companyCode')
    .populate('branch', 'branchName branchCode');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'read');

  return user;
};

// ════════════════════════════════════════
// Update User
// ════════════════════════════════════════
export const updateUser = async (id, data, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  // ── Check email uniqueness if changing ──
  if (data.email && data.email.toLowerCase() !== user.email) {
    const existingEmail = await User.findOne({
      email: data.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingEmail) {
      throw ApiError.conflict(`Email "${data.email}" is already in use`);
    }
  }

  // ── Validate client exists (if changing) ──
  if (data.client) {
    const clientExists = await Client.findById(data.client);
    if (!clientExists) {
      throw ApiError.notFound('Specified client does not exist');
    }
  }

  // ── Validate branch exists (if changing) ──
  if (data.branch) {
    const branch = await Branch.findById(data.branch);
    if (!branch) {
      throw ApiError.notFound('Specified branch does not exist');
    }
  }

  // Strip undefined/null fields
  const updatePayload = cleanObject({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    client: data.client,
    branch: data.branch,
  });

  const updatedUser = await User.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .populate('client', 'companyName companyCode')
    .populate('branch', 'branchName branchCode');

  return updatedUser;
};

// ════════════════════════════════════════
// Delete User (Soft Delete)
// ════════════════════════════════════════
export const deleteUser = async (id, requestingUser) => {
  const user = await User.findById(id).select('+isDeleted');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isDeleted) {
    throw ApiError.notFound('User not found');
  }

  // Cannot delete SUPER_ADMIN
  if (user.role === ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Super Admin users cannot be deleted');
  }

  // BRANCH_MANAGER cannot delete users
  if (requestingUser.role === ROLES.BRANCH_MANAGER) {
    throw ApiError.forbidden('Branch Managers are not authorized to delete users');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  // Soft delete
  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  return null;
};

// ════════════════════════════════════════
// Activate User
// ════════════════════════════════════════
export const activateUser = async (id, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  if (user.isActive) {
    throw ApiError.badRequest('User is already active');
  }

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  return user;
};

// ════════════════════════════════════════
// Deactivate User
// ════════════════════════════════════════
export const deactivateUser = async (id, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Cannot deactivate SUPER_ADMIN
  if (user.role === ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Super Admin users cannot be deactivated');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  if (!user.isActive) {
    throw ApiError.badRequest('User is already deactivated');
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  return user;
};

// ════════════════════════════════════════
// Update User Role
// ════════════════════════════════════════
export const updateUserRole = async (id, data, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  const newRole = data.role;

  // Only SUPER_ADMIN can assign SUPER_ADMIN role
  if (newRole === ROLES.SUPER_ADMIN && requestingUser.role !== ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Only Super Admins can assign the Super Admin role');
  }

  // CLIENT_ADMIN cannot assign roles above CLIENT_ADMIN
  if (
    requestingUser.role === ROLES.CLIENT_ADMIN &&
    getRoleLevel(newRole) >= getRoleLevel(ROLES.CLIENT_ADMIN)
  ) {
    throw ApiError.forbidden('Client Admins cannot assign Client Admin or higher roles');
  }

  user.role = newRole;
  await user.save({ validateBeforeSave: false });

  return user;
};

// ════════════════════════════════════════
// Reset User Password (Admin)
// ════════════════════════════════════════
export const resetUserPassword = async (id, data, requestingUser) => {
  // Must select password to trigger pre-save hook comparison
  const user = await User.findById(id).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  // Set new password (hashed by pre-save hook)
  user.password = data.password;

  // Invalidate refresh token to force re-login
  user.refreshToken = null;

  await user.save();

  return null;
};

// ════════════════════════════════════════
// Assign User to Client
// ════════════════════════════════════════
export const assignUserToClient = async (id, data, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Only SUPER_ADMIN can reassign clients
  if (requestingUser.role !== ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Only Super Admins can assign users to clients');
  }

  // Validate client exists
  const clientExists = await Client.findById(data.client);
  if (!clientExists) {
    throw ApiError.notFound('Specified client does not exist');
  }

  user.client = data.client;
  // Clear branch when client changes (branch may not belong to new client)
  user.branch = null;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(id)
    .populate('client', 'companyName companyCode')
    .populate('branch', 'branchName branchCode');

  return updatedUser;
};

// ════════════════════════════════════════
// Assign User to Branch
// ════════════════════════════════════════
export const assignUserToBranch = async (id, data, requestingUser) => {
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Enforce scope
  enforceScopeAccess(requestingUser, user, 'manage');

  // Validate branch exists
  const branch = await Branch.findById(data.branch);
  if (!branch) {
    throw ApiError.notFound('Specified branch does not exist');
  }

  // Ensure branch belongs to the user's client
  if (user.client && branch.client.toString() !== user.client.toString()) {
    throw ApiError.badRequest('Branch does not belong to the user\'s client');
  }

  user.branch = data.branch;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(id)
    .populate('client', 'companyName companyCode')
    .populate('branch', 'branchName branchCode');

  return updatedUser;
};
