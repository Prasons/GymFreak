import React, { useState } from "react";
import { registerUser } from "../api/userApi";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { TextField } from "@mui/material";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await registerUser({
        name,
        email,
        password,
        referral_code: referralCode || undefined,
      });
      setSuccessMessage("Successfully signed up! Please check your email to verify your account.");
      setName("");
      setEmail("");
      setPassword("");
      setReferralCode("");
    } catch (error) {
      console.error("Sign up failed:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message === "User already exists"
      ) {
        setSuccessMessage("Account already exists. Please log in.");
      } else {
        setSuccessMessage("Sign up failed. Please try again.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-light text-center mb-6">
          Sign Up 
        </h2>
        {successMessage && (
          <p className="text-center text-green-500 mb-4">{successMessage}</p>
        )}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-light text-sm mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-3 border border-accent bg-primary text-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{
                input: { color: "white" },
                "& .MuiInputBase-input::placeholder": { color: "#f7fafc" }, // Matches placeholder-light
                label: { color: "white" },
                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "white",
                },
                "& .MuiInput-underline:after": { borderBottomColor: "white" },
              }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="referralCode" className="block text-light text-sm mb-2">
              Referral Code (optional)
            </label>
            <input
              type="text"
              id="referralCode"
              className="w-full p-3 border border-accent bg-primary text-light placeholder-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter referral code if you have one"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            {referralCode && (
              <span className="text-xs text-green-300 mt-1 block">Using referral code: {referralCode}</span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-light py-3 rounded-md hover:bg-light hover:text-primary transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
