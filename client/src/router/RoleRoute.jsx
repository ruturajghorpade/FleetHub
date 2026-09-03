// FleetHub – RoleRoute (Role-Based Access Guard)
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HIERARCHY } from '@/config/roleConfig';

/**
 * Restricts access based on user role.
 * @param {string[]} allowedRoles – Array of role strings that are allowed access.
 */
const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed list
  const hasRole = allowedRoles.includes(user.role);

  // Also allow if user's role is higher in hierarchy
  const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role);
  const minAllowedIndex = Math.min(
    ...allowedRoles.map((r) => ROLE_HIERARCHY.indexOf(r)).filter((i) => i >= 0)
  );
  const hasHigherRole = userRoleIndex >= 0 && userRoleIndex <= minAllowedIndex;

  if (!hasRole && !hasHigherRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
