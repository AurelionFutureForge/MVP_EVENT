import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("admin_Token");

  if (!token) {
    return <Navigate to="/admin/register" replace />;
  }

  return children;
};

export default ProtectedRoute;
