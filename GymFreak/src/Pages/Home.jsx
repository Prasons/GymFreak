import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary text-light">
      {/* Navigation Bar */}
      <nav className="bg-black py-4 px-6 fixed w-full top-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-accent">GymFreak</h1>
          <ul className="flex space-x-6">
            <li
              className="cursor-pointer hover:text-accent"
              onClick={() => navigate("/membership")}
            >
              Buy Membership
            </li>
            <li
              className="cursor-pointer hover:text-accent"
              onClick={() => navigate("/shop")}
            >
              Shop
            </li>
            <li
              className="cursor-pointer hover:text-accent"
              onClick={() => navigate("/login")}
            >
              Log In
            </li>
            <li
              className="cursor-pointer hover:text-accent"
              onClick={() => navigate("/admin/login")}
            >
              Admin Login
            </li>

            <li
              className="cursor-pointer hover:text-accent"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex items-center justify-center h-screen bg-black bg-opacity-50 mt-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-light mb-6">
            Welcome to <span className="text-accent">GymFreak</span>
          </h1>
          <p className="text-lg text-accent mb-8">
            Your ultimate destination for fitness, strength, and health.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-secondary text-light rounded-lg shadow-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 bg-accent text-black rounded-lg shadow-lg hover:bg-light focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 px-6 bg-primary text-light">
        {/* About Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-accent mb-4">About Us</h2>
          <p className="text-lg leading-7">
            GymFreak is your trusted partner in achieving fitness goals. We
            provide top-notch facilities, professional trainers, and customized
            programs tailored to your needs.
          </p>
        </div>

        {/* Additional Sections... */}
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-6 text-center">
        <p className="text-accent text-sm">
          © 2025 GymFreak. All Rights Reserved.
        </p>
        <div className="mt-4 space-x-4">
          <span
            className="cursor-pointer hover:text-light"
            onClick={() => navigate("/membership")}
          >
            Buy Membership
          </span>
          <span
            className="cursor-pointer hover:text-light"
            onClick={() => navigate("/shop")}
          >
            Shop
          </span>
          <span
            className="cursor-pointer hover:text-light"
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
          <span
            className="cursor-pointer hover:text-light"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
