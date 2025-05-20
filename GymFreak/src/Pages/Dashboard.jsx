import React from "react";
import {
  FaCreditCard,
  FaUserFriends,
  FaClipboardList,
  FaShoppingCart,
  FaDumbbell,
  FaMoneyBillWave,
  FaGift,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Add logout function
  const handleLogout = () => {
    // Clear any authentication-related state (e.g., localStorage, sessionStorage)
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    // Redirect to home (landing) page
    navigate("/");
  };

  const options = [
    { name: "Membership", icon: <FaCreditCard />, path: "/membership" },
    { name: "Diet Plan", icon: <FaClipboardList />, path: "/dietplan" },
    { name: "Workout Plan", icon: <FaDumbbell />, path: "/workoutplan" },
    { name: "Training Schedule", icon: <FaCalendarAlt />, path: "/trainingschedule" },
    { name: "Referral Program", icon: <FaGift />, path: "/referral" },
    { name: "Refer a Friend", icon: <FaUserFriends />, path: "/referafriend" },
    { name: "Shopping Cart", icon: <FaShoppingCart />, path: "/shoppingcart" },
    { name: "Gym Equipment", icon: <FaDumbbell />, path: "/gymequipment" },
    { name: "Payment", icon: <FaMoneyBillWave />, path: "/payment" },
  ];

  return (
    <div className="min-h-screen bg-primary text-light">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-light">
          Welcome to Your Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 p-6">
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-secondary p-6 rounded-lg shadow-lg text-center hover:bg-accent cursor-pointer transition-colors duration-300"
            onClick={() => navigate(option.path)}
          >
            <div className="text-4xl mb-4">{option.icon}</div>
            <h3 className="text-xl text-light">{option.name}</h3>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-danger text-light rounded-lg shadow-lg hover:bg-light focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
