import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaUserFriends,
  FaClipboardList,
  FaShoppingCart,
  FaDumbbell,
  FaMoneyBillWave,
  FaGift,
  FaCalendarAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCog,
  FaChartLine,
  FaStore,
  FaUtensils
} from "react-icons/fa";

// Import all page components
import Profile from "./Profile";
import Progress from "./Progress";
import MembershipPage from "./MembershipPage";
import WorkoutPlan from "./WorkoutPlan";
import DietPlan from "./DietPlan";
import TrainingSchedule from "./TrainingSchedule";
import ReferralDashboard from "./ReferralDashboard";
import ShoppingCartPage from "./ShoppingCartPage";
import NutritionSearch from "./NutritionSearch";
import GymEquipmentPage from "./GymEquipmentPage";
import PaymentPage from "./PaymentPage";
const Dashboard = () => {
  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const defaultTab = queryParams.get('redirect') || 'profile';
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState(defaultTab);
  

  // Dummy user data - replace with actual user data
  const user = {
    name: "John Doe",
    membership: "Premium",
    email: "john@example.com",
    profileImage: null
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/home");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: <FaUser />, 
      component: <Profile /> 
    },
    { 
      id: 'membership', 
      name: 'Membership', 
      icon: <FaCreditCard />, 
      component: <MembershipPage /> 
    },
    { 
      id: 'workout', 
      name: 'Workout Plan', 
      icon: <FaDumbbell />, 
      component: <WorkoutPlan /> 
    },
    { 
      id: 'diet', 
      name: 'Diet Plan', 
      icon: <FaClipboardList />, 
      component: <DietPlan /> 
    },
    { 
      id: 'referral', 
      name: 'Referral Program', 
      icon: <FaUserFriends />, 
      component: <ReferralDashboard /> 
    },
    { 
      id: 'shop', 
      name: 'Shop', 
      icon: <FaStore />, 
      component: <GymEquipmentPage /> 
    },
    { 
      id: 'cart', 
      name: 'Shopping Cart', 
      icon: <FaShoppingCart />, 
      component: <ShoppingCartPage /> 
    },
    { 
      id: 'payment', 
      name: 'Payment', 
      icon: <FaMoneyBillWave />, 
      component: <PaymentPage /> 
    },
    { 
      id: 'nutrition', 
      name: 'Nutrition', 
      icon: <FaUtensils />, 
      component: <NutritionSearch /> 
    },
    
  ];

  return (
    <div className="min-h-screen bg-primary text-light flex">
      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-secondary transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-neutral/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral rounded-full flex items-center justify-center">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-2xl text-light" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{user.name}</h2>
              <p className="text-sm text-neutral truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <nav className="p-4 space-y-1 h-full overflow-y-auto">
            {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === item.id ? 'bg-accent text-light' : 'text-neutral hover:text-light hover:bg-neutral/10'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}

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
        </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-secondary shadow-md">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-2xl hover:text-accent transition-colors"
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-semibold">
              {menuItems.find(item => item.id === activeView)?.name || 'Dashboard'}
            </h1>
            <div className="w-8" /> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {/* Render active component */}
          {menuItems.find(item => item.id === activeView)?.component}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Dashboard;
