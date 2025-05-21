import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaUserFriends,
  FaClipboardList,
  FaShoppingCart,
  FaDumbbell,
  FaMoneyBillWave,
  FaGift,
  FaCalendarAlt,
  FaUser
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  // Dummy user data - replace with actual user data
  const user = {
    name: "John Doe",
    membership: "Premium",
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  const options = [
    { name: "Membership", icon: <FaCreditCard />, path: "/membership" },
    { name: "Diet Plan", icon: <FaClipboardList />, path: "/dietplan" },
    { name: "Workout Plan", icon: <FaDumbbell />, path: "/workoutplan" },
    { name: "Training Schedule", icon: <FaCalendarAlt />, path: "/schedule" },
    { name: "Referral Program", icon: <FaUserFriends />, path: "/referral" },
    { name: "Refer a Friend", icon: <FaGift />, path: "/refer" },
    { name: "Shopping Cart", icon: <FaShoppingCart />, path: "/shoppingcart" },
    { name: "Gym Equipment", icon: <FaDumbbell />, path: "/gymequipment" },
    { name: "Payment", icon: <FaMoneyBillWave />, path: "/payment" },
  ];

  return (
    <div className="min-h-screen bg-primary text-light p-6">
      {/* Header Section with User Profile */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-secondary rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-neutral rounded-full flex items-center justify-center shadow-lg">
                <FaUser className="text-4xl text-light" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-light mb-2">Welcome back, {user.name}</h1>
                <p className="text-neutral">{user.membership} Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-light mb-6">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {options.map((option, index) => (
            <div
              key={index}
              className="group bg-secondary p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 hover:bg-neutral/10 hover:-translate-y-1"
              onClick={() => navigate(option.path)}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="text-3xl transition-colors duration-300 text-accent group-hover:text-light">
                  {option.icon}
                </div>
                <h3 className="text-lg font-medium text-light group-hover:text-light">{option.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
