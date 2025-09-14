import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/" replace />; // redirect to home or login
  }
  return children;
};

export default ProtectedRoute;
