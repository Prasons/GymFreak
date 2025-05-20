import { Navigate, Outlet } from "react-router-dom";

const AuthWrapper = ({ isAuthenticated, redirectPath = "/login" }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default AuthWrapper;
