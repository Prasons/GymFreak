import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { toast } from 'react-toastify';
import { isTokenExpired } from "../utils/auth";
import {
  FaUsers,
  FaDumbbell,
  FaMoneyBillWave,
  FaGift,
  FaShoppingCart,
  FaUserTie,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Check for token expiration on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (isTokenExpired(adminToken)) {
      // Redirect to login with session expired message
      navigate('/admin/login?sessionExpired=true');
    }
    
    // Set up a periodic check for token expiration (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      if (isTokenExpired(localStorage.getItem('adminToken'))) {
        clearInterval(tokenCheckInterval);
        navigate('/admin/login?sessionExpired=true');
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);
  
  const handleLogout = () => {
    // Clear admin auth data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminInfo');
    
    // Clear axios default headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    // Navigate to login
    navigate('/admin/login');
    
    // Notify the app that admin has logged out
    window.dispatchEvent(new Event('adminLogout'));
  };

  const stats = [
    { icon: <FaUsers />, label: "Total Members", value: 120 },
    { icon: <FaDumbbell />, label: "Trainers", value: 8 },
    { icon: <FaMoneyBillWave />, label: "Monthly Revenue", value: "$4,500" },
    { icon: <FaGift />, label: "Referrals This Month", value: 25 },
  ];

  const navigationLinks = [
    { path: "/admin/members", label: "Manage Members", icon: <FaUsers /> },
    { path: "/admin/trainers", label: "Manage Trainers", icon: <FaUserTie /> },
    {
      path: "/admin/products",
      label: "Manage Products",
      icon: <FaShoppingCart />,
    },
    {
      path: "/admin/diet-plan",
      label: "Manage Diet Plans",
      icon: <FaClipboardList />,
    },
    {
      path: "/admin/workout-plan",
      label: "Manage Workout Plans",
      icon: <FaDumbbell />,
    },
    {
      path: "/admin/training-schedule",
      label: "Manage Training Schedules",
      icon: <FaDumbbell />,
    },
    {
      path: "/admin/payment",
      label: "Manage Payments",
      icon: <FaMoneyCheckAlt />,
    },
    { path: "/admin/referral", label: "Manage Referrals", icon: <FaGift /> },
    { path: "/admin/referral-dashboard", label: "Referral Dashboard", icon: <FaGift /> },
    { path: "/admin/classes", label: "Manage Classes", icon: <FaDumbbell /> },
  ];

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      {/* Header with Logout Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div 
            key={`stat-${idx}`}
            className="bg-secondary p-6 rounded-lg flex flex-col items-center shadow-md"
          >
            <div className="text-4xl text-accent mb-2">{stat.icon}</div>
            <p className="text-lg font-semibold">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Navigation Section */}
      <h2 className="text-2xl font-semibold mb-6">Quick Navigation</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationLinks.map((nav, idx) => (
          <Link
            to={nav.path}
            key={`nav-${idx}`}
            className="bg-secondary p-6 rounded-lg flex flex-col items-center shadow-md hover:bg-accent hover:text-primary transition-all duration-300"
          >
            <div className="text-4xl mb-2">{nav.icon}</div>
            <p className="text-lg font-semibold">{nav.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
};

export default AdminDashboard;
