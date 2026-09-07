// FleetHub – RoleRoute (Role-Based Access Guard)
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasAllowedRole } from '@/utils/permissions';
import Loader from '@/components/common/Loader';

/**
 * Restricts route access based on user's active role.
 * @param {string[]} allowedRoles – Array of role strings allowed access.
 */
const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Verifying role permissions..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role has access
  const isAuthorized = hasAllowedRole(user.role, allowedRoles);

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
