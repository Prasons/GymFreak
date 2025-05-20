import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  CssBaseline, 
  IconButton, 
  InputAdornment, 
  Link as MuiLink, 
  Paper, 
  TextField, 
  Typography, 
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { saveTokens, isAuthenticated, isAdmin, clearAuthData } from '../utils/auth';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: '0 auto',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(3),
  },
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
}));

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for expired session in the URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionExpired = searchParams.get('sessionExpired');
    
    if (sessionExpired === 'true') {
      setError('Your session has expired. Please log in again.');
      // Clear any existing auth data
      clearAuthData(true);
    }
  }, [location]);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated() && isAdmin()) {
      const from = location.state?.from?.pathname || "/admin/dashboard";
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Sending login request...');
      const response = await axiosInstance.post('/admin/login', {
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      const { accessToken, refreshToken, admin } = response.data;
      
      if (!accessToken) {
        console.error('No access token in response:', response.data);
        throw new Error('No authentication token received');
      }
      
      // Save tokens and admin data
      saveTokens({
        accessToken,
        refreshToken,
        isAdmin: true,
        adminToken: accessToken // Explicitly set adminToken
      });
      
      // Store admin info and set admin flag
      localStorage.setItem('adminInfo', JSON.stringify(admin));
      localStorage.setItem('adminAuth', 'true');
      
      // Set default authorization header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Show success message
      toast.success('Login successful!');
      
      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
      
      // Notify other components about the login
      window.dispatchEvent(new Event('adminLogin'));
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with an error status code
        errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <LockIcon 
            color="primary" 
            sx={{ 
              fontSize: 40, 
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              p: 1,
              borderRadius: '50%',
              mb: 2
            }} 
          />
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Admin Portal
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Sign in to access the admin dashboard
          </Typography>

          <Form onSubmit={handleSubmit} noValidate>
            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
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
              type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 3,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </SubmitButton>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink 
                component={Link} 
                to="/" 
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
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
