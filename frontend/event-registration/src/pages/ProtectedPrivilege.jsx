import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("privilegeToken");

  if (!token) {
    return <Navigate to="/privilege-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
