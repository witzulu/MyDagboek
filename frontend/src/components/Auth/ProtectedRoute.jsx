import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'system_admin') {
    return <Navigate to="/projects" replace />; // Or a custom "Unauthorized" page
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  adminOnly: PropTypes.bool,
};

export default ProtectedRoute;
