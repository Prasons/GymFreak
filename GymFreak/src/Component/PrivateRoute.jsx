import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken, isAuthenticated } from "../utils/auth";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const [isValid, setIsValid] = useState(null);
  const location = useLocation();
  
  // Bypass auth in development
  if (process.env.NODE_ENV === 'development') {
    return children;
  }
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAccessToken();
        const isAdmin = localStorage.getItem('adminAuth') === 'true';
        
        // If no token, not authenticated
        if (!token) {
          console.log('No token found, redirecting to login');
          setIsValid(false);
          return;
        }

        // Verify token is not expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          console.log('Token expired');
          localStorage.removeItem(adminOnly ? 'adminToken' : 'authToken');
          localStorage.removeItem('refreshToken');
          if (adminOnly) {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('adminInfo');
          }
          setIsValid(false);
          return;
        }
        
        // If route is admin-only but user is not admin
        if (adminOnly && !isAdmin) {
          console.log('Admin access required');
          toast.error('Admin access required');
          setIsValid(false);
          return;
        }
        
        // All checks passed
        setIsValid(true);
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear invalid tokens
        localStorage.removeItem(adminOnly ? 'adminToken' : 'authToken');
        localStorage.removeItem('refreshToken');
        if (adminOnly) {
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminInfo');
        }
        setIsValid(false);
      }
    };
    
    checkAuth();
  }, [adminOnly, location.pathname]);
  
  if (isValid === null) {
    // Show loading state while checking auth
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isValid) {
    // Redirect to login if not authenticated
    const redirectPath = adminOnly ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  return children;
};

export default PrivateRoute;
