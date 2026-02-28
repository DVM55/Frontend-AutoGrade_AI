import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role mà sai → chuyển về trang đúng của role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "TEACHER") {
      return <Navigate to="/teacher" replace />;
    } else if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
