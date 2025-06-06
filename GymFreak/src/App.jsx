import React, { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";

// Pages
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import Membership from "./Pages/MembershipPage";
import DietPlan from "./Pages/DietPlan";
import WorkoutPlanPage from "./Pages/WorkoutPlan";
import TrainingSchedulePage from "./Pages/TrainingSchedule";
import ReferralDashboard from "./Pages/ReferralDashboard";
import ReferAFriend from "./Pages/ReferPage";
import ShoppingCart from "./Pages/ShoppingCartPage";
import GymEquipment from "./Pages/GymEquipmentPage";
import Payment from "./Pages/PaymentPage";

// Admin Pages
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminMembers from "./admin/AdminMembers";
import AdminDietPlan from "./admin/AdminDietPlan";
import AdminWorkoutPlan from "./admin/AdminWorkoutPlan";
import AdminTrainingSchedule from "./admin/AdminTrainingSchedule";
import AdminReferralDashboard from "./admin/AdminReferralDashboard";
import AdminReferral from "./admin/AdminReferral";
import AdminProducts from "./admin/AdminProducts";
import AdminTrainers from "./admin/AdminTrainers";
import AdminPayment from "./admin/AdminPayment";
import AdminClasses from "./admin/AdminClasses";

// Components
import PrivateRoute from "./Component/PrivateRoute";

// Bypassing auth for development
function ProtectedRoute({ children }) {
  // Auto-login for development
  if (!localStorage.getItem("adminAuth")) {
    localStorage.setItem('adminAuth', 'true');
    localStorage.setItem('adminToken', 'dummy-admin-token');
  }
  return children;
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("authToken") !== null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem("adminAuth") === "true";
  });

  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/home";

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedItems);
    
    // Listen for admin login/logout events
    const handleAdminLogin = () => {
      setIsAdminAuthenticated(true);
    };
    
    const handleAdminLogout = () => {
      setIsAdminAuthenticated(false);
    };
    
    window.addEventListener('adminLogin', handleAdminLogin);
    window.addEventListener('adminLogout', handleAdminLogout);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('adminLogin', handleAdminLogin);
      window.removeEventListener('adminLogout', handleAdminLogout);
    };
  }, []);
  
  // Auto-login for development
  useEffect(() => {
    // Auto-login for development
    if (process.env.NODE_ENV === 'development' && !localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', 'dummy-user-token');
      localStorage.setItem('userInfo', JSON.stringify({ email: 'dev@example.com', name: 'Developer' }));
      setIsAuthenticated(true);
    }
    localStorage.setItem('adminAuth', 'true');
    localStorage.setItem('adminToken', 'dummy-admin-token');
    setIsAdminAuthenticated(true);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("authToken", "dummy-token");
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    navigate("/home");
  };

  const handleAddToCart = (item) => {
    const updatedCart = [...cartItems, item];
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  return (
    <>
      {!isLandingPage && (
        <AppBar position="static">
          <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
            {isAdminAuthenticated ? (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            ) : isAuthenticated ? (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            ) : null}
            {!isAuthenticated && !isAdminAuthenticated && (
              <>
                <Button color="inherit" href="/login">
                  Login
                </Button>
                <Button color="inherit" href="/admin/login">
                  Admin Login
                </Button>
                <Button color="inherit" href="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}

      <Routes>
        {/* User Routes */}
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/dietplan" element={<DietPlan />} />
        <Route path="/workoutplan" element={<WorkoutPlanPage />} />
        <Route path="/trainingschedule" element={<TrainingSchedulePage />} />
        <Route path="/schedule" element={<Navigate to="/trainingschedule" replace />} />
        <Route path="/referral" element={<ReferralDashboard />} />
        <Route path="/referafriend" element={<ReferAFriend />} />
        <Route
          path="/shoppingcart"
          element={<ShoppingCart cartItems={cartItems} />}
        />
        <Route
          path="/gymequipment"
          element={<GymEquipment onAddToCart={handleAddToCart} />}
        />
        <Route path="/payment" element={<Payment />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/members" element={<AdminMembers />} />
        <Route path="/admin/diet-plan" element={<AdminDietPlan />} />
        <Route path="/admin/workout-plan" element={<AdminWorkoutPlan />} />
        <Route path="/admin/training-schedule" element={<AdminTrainingSchedule />} />
        <Route path="/admin/referral" element={<AdminReferral />} />
        <Route path="/admin/referral-dashboard" element={<AdminReferralDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/trainers" element={<AdminTrainers />} />
        <Route path="/admin/payment" element={<AdminPayment />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/" element={<Navigate to="/home" />} />{" "}
        {/* Redirect root path to /home */}
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default AppWrapper;
