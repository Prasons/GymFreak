import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaCalendarAlt,
  FaClipboardList,
  FaCog,
  FaDumbbell,
  FaGift,
  FaIdCard,
  FaMoneyCheckAlt,
  FaSignOutAlt,
  FaStore,
  FaTimes,
  FaUser,
  FaUserTie,
  FaUsers,
  FaBoxes
} from "react-icons/fa";

// Import admin components
import AdminClasses from "./AdminClasses";
import AdminDietPlan from "./AdminDietPlan";
import AdminMembers from "./AdminMembers";
import AdminMembershipPlans from "./AdminMembershipPlans";
import AdminPayment from "./AdminPayment";
import AdminProducts from "./AdminProducts";
import AdminReferral from "./AdminReferral";
import AdminTrainers from "./AdminTrainers";
import AdminTrainingSchedule from "./AdminTrainingSchedule";
import AdminWorkoutPlan from "./AdminWorkoutPlan";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("members");

  // Admin user data
  const admin = {
    name: "Admin User",
    role: "Administrator",
    email: "admin@gymfreak.com",
    profileImage: null,
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    {
      id: "members",
      name: "Members",
      icon: <FaUsers />,
      component: <AdminMembers />,
    },
    {
      id: "trainers",
      name: "Trainers",
      icon: <FaUserTie />,
      component: <AdminTrainers />,
    },
    {
      id: "membership-plans",
      name: "Membership Plans",
      icon: <FaIdCard />,
      component: <AdminMembershipPlans />,
    },
    {
      id: "products",
      name: "Products",
      icon: <FaStore />,
      component: <AdminProducts />,
    },
    {
      id: "diet-plans",
      name: "Diet Plans",
      icon: <FaClipboardList />,
      component: <AdminDietPlan />,
    },
    {
      id: "workout-plans",
      name: "Workout Plans",
      icon: <FaDumbbell />,
      component: <AdminWorkoutPlan />,
    },    
    {
      id: "payments",
      name: "Payments",
      icon: <FaMoneyCheckAlt />,
      component: <AdminPayment />,
    },
    {
      id: "referrals",
      name: "Referrals",
      icon: <FaGift />,
      component: <AdminReferral />,
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 h-screen flex-shrink-0 p-4 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className={`${!isSidebarOpen && "hidden"} text-xl font-bold`}>
            GymFreak Admin
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Admin Profile */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
            {admin.profileImage ? (
              <img
                src={admin.profileImage}
                alt={admin.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FaUser className="text-3xl text-gray-400" />
            )}
          </div>
          <div className={`${!isSidebarOpen && "hidden"}`}>
            <h3 className="text-lg font-semibold">{admin.name}</h3>
            <p className="text-gray-400 text-sm">{admin.role}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <nav className="space-y-2 overflow-y-auto pr-2">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeView === item.id ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`${!isSidebarOpen && "hidden"} ml-3`}>
                  {item.name}
                </span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-red-500/30"
          >
            <FaSignOutAlt className="text-xl" />
            <span className={`${!isSidebarOpen && "hidden"} ml-3 font-medium`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full h-screen">
        <div className="p-8 h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              {menuItems.find((item) => item.id === activeView)?.name}
            </h1>
            
          </div>

          {/* Dynamic Content */}
          {menuItems.find((item) => item.id === activeView)?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
