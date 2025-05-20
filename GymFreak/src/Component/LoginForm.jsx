// src/components/LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";

export default function LoginForm({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Replace with your actual authentication logic
      const response = await fakeAuthAPI(email, password);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem("authToken", response.token);

        // Redirect based on user role
        if (response.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
    >
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <Typography color="error">{error}</Typography>}

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>
    </Box>
  );
}

// Mock authentication function
async function fakeAuthAPI(email, password) {
  // In a real app, this would be an API call to your backend
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === "admin@gym.com" && password === "admin123") {
        resolve({
          success: true,
          token: "fake-admin-token",
          user: { id: 1, name: "Admin", role: "admin" },
        });
      } else if (email === "user@gym.com" && password === "user123") {
        resolve({
          success: true,
          token: "fake-user-token",
          user: { id: 2, name: "Member", role: "user" },
        });
      } else {
        resolve({ success: false });
      }
    }, 500);
  });
}
