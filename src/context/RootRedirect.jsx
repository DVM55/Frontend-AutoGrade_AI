// src/components/RootRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div></div>;

  if (!user) return <Navigate to="/trang-chu" replace />;

  switch (user.role) {
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    case "TEACHER":
      return <Navigate to="/teacher" replace />;
    case "USER":
    default:
      return <Navigate to="/user" replace />;
  }
};

export default RootRedirect;
