import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Fade,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Mock admin credentials for demo
const MOCK_ADMIN = {
  email: "admin@example.com",
  password: "password123"
};

const saveAuthData = () => {
  // Mock token expiration in 1 hour
  const expiresIn = 60 * 60 * 1000;
  const expirationTime = new Date().getTime() + expiresIn;
  
  localStorage.setItem("adminToken", "mock-jwt-token");
  localStorage.setItem("adminInfo", JSON.stringify({
    id: 1,
    name: "Admin User",
    email: MOCK_ADMIN.email,
    role: "admin"
  }));
  localStorage.setItem("tokenExpiration", expirationTime.toString());
};

const clearAuthData = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminInfo");
  localStorage.removeItem("tokenExpiration");
};

const isAuthenticated = () => {
  const token = localStorage.getItem("adminToken");
  const expiration = localStorage.getItem("tokenExpiration");
  return token && expiration && new Date().getTime() < parseInt(expiration);
};

const isAdmin = () => {
  const adminInfo = localStorage.getItem("adminInfo");
  return adminInfo && JSON.parse(adminInfo).role === "admin";
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: 400,
  margin: "0 auto",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(3),
  },
}));

const Form = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
}));

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in on component mount
  React.useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      const from = location.state?.from?.pathname || "/admin/dashboard";
      navigate(from, { replace: true });
    }
  }, [navigate, location]);
  
  // Check for expired session in the URL query params
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionExpired = searchParams.get("sessionExpired");

    if (sessionExpired === "true") {
      setError("Your session has expired. Please log in again.");
      clearAuthData();
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Check credentials against mock data
        if (formData.email === MOCK_ADMIN.email && formData.password === MOCK_ADMIN.password) {
          // Save auth data to localStorage
          saveAuthData();
          
          // Show success message
          toast.success("Login successful!");
          
          // Redirect to dashboard
          const from = location.state?.from?.pathname || "/admin/dashboard";
          navigate(from, { replace: true });
          
          // Notify other components
          window.dispatchEvent(new Event("adminLogin"));
        } else {
          throw new Error("Invalid email or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error.message || "Login failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 800); // Simulate network delay
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <StyledPaper>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <LockIcon
            color="primary"
            sx={{
              fontSize: 40,
              bgcolor: "primary.light",
              color: "primary.contrastText",
              p: 1,
              borderRadius: "50%",
              mb: 2,
            }}
          />
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Admin Portal
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Sign in to access the admin dashboard
          </Typography>

          <Form onSubmit={handleSubmit} noValidate>
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={isLoading || !formData.email || !formData.password}
              disableElevation
              sx={{
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: 3,
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </SubmitButton>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <MuiLink
                component={Link}
                to="/"
                variant="body2"
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                ← Back to Home
              </MuiLink>
            </Box>
          </Form>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default AdminLogin;
