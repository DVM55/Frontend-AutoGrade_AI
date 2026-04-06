import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div></div>;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // ⭐ QUAN TRỌNG
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
