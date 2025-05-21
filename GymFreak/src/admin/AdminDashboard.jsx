import React from "react";
import { Link, useLocation } from "react-router-dom";
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

const stats = [
  {
    icon: <FaUsers />,
    label: "Total Members",
    value: 120,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    icon: <FaDumbbell />,
    label: "Trainers",
    value: 8,
    color: "bg-gradient-to-r from-green-400 to-blue-500",
  },
  {
    icon: <FaMoneyBillWave />,
    label: "Monthly Revenue",
    value: "$4,500",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
  {
    icon: <FaGift />,
    label: "Referrals",
    value: 25,
    color: "bg-gradient-to-r from-pink-400 to-red-500",
  },
];

const navigationLinks = [
  { path: "/admin/members", label: "Members", icon: <FaUsers /> },
  { path: "/admin/trainers", label: "Trainers", icon: <FaUserTie /> },
  { path: "/admin/products", label: "Products", icon: <FaShoppingCart /> },
  { path: "/admin/diet-plan", label: "Diet Plans", icon: <FaClipboardList /> },
  { path: "/admin/workout-plan", label: "Workout Plans", icon: <FaDumbbell /> },
  {
    path: "/admin/training-schedule",
    label: "Schedules",
    icon: <FaDumbbell />,
  },
  { path: "/admin/payment", label: "Payments", icon: <FaMoneyCheckAlt /> },
  { path: "/admin/referral", label: "Referrals", icon: <FaGift /> },
  {
    path: "/admin/referral-dashboard",
    label: "Referral Stats",
    icon: <FaGift />,
  },
  { path: "/admin/classes", label: "Classes", icon: <FaDumbbell /> },
];

const StatCard = ({ icon, label, value, color }) => (
  <div
    className={`text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition ${color}`}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <p className="text-sm uppercase tracking-wider text-white/80">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-light">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 backdrop-blur-lg border-r border-gray-700 p-6 flex flex-col justify-between shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-accent mb-12 tracking-tight">
            Gym Admin
          </h2>
          <nav className="space-y-3">
            {navigationLinks.map((nav, idx) => (
              <Link
                key={idx}
                to={nav.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition duration-200
                  ${
                    location.pathname === nav.path
                      ? "bg-accent text-primary font-bold shadow"
                      : "hover:bg-accent hover:text-primary text-gray-300"
                  }`}
              >
                <span className="text-xl">{nav.icon}</span>
                <span className="text-sm font-medium">{nav.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition shadow"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto text-white">
        <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-white">
          Dashboard Overview
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Navigation Cards */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationLinks.map((nav, idx) => (
            <Link
              key={idx}
              to={nav.path}
              className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-accent hover:text-primary p-6 rounded-2xl shadow-xl flex flex-col items-center text-center transition-all duration-300"
            >
              <div className="text-4xl mb-2">{nav.icon}</div>
              <p className="text-lg font-semibold">{nav.label}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
