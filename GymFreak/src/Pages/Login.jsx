import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/userApi";
import { saveTokens } from "../utils/auth";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/material";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        const response = await loginUser(email, password);
        // The API returns token and refreshToken at the root level
        const { token, refreshToken, user } = response;
        
        if (!token) {
          alert("Login failed: No token received");
          return;
        }
        
        saveTokens({
          accessToken: token,  // Map token to accessToken
          refreshToken,
          isAdmin: user?.isAdmin || false
        });
        localStorage.setItem('userInfo', JSON.stringify(user));
        onLogin(); // Call the parent's login function
        navigate("/dashboard"); // Redirect after login
      } catch (error) {
        console.error("Login failed:", error);
        console.log("Error response:", error.response?.data);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('Error data:', error.response.data);
          console.log('Error status:', error.response.status);
          console.log('Error headers:', error.response.headers);
          
          if (error.response.status === 400) {
            if (error.response.data.message === "Invalid email") {
              alert("The email you entered does not exist.");
            } else if (error.response.data.message === "Invalid password") {
              alert("The password you entered is incorrect.");
            } else {
              alert(`Login failed: ${error.response.data.message || 'Invalid request'}`);
            }
          } else {
            alert(`Server error: ${error.response.status} - ${error.response.data.message || 'Something went wrong'}`);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.log('Error request:', error.request);
          alert('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error message:', error.message);
          alert(`Error: ${error.message}`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-light text-center mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-light text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-accent bg-primary text-light placeholder-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-light text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-accent bg-primary text-light placeholder-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-light py-3 rounded-md hover:bg-light hover:text-primary transition"
          >
            Login
          </button>
        </form>
         <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                to="/"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                ← Back to Home
              </Link>
            </Box>
      </div>
    </div>
  );
}
