import { toast } from 'react-toastify';
import { clearAuthData } from '../utils/auth';

/**
 * Handle API errors consistently across the application
 * @param {Error} error - The error object from axios
 * @param {string} [customMessage] - Custom error message to display
 */
export const handleApiError = (error, customMessage) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        message = 'Your session has expired. Please log in again.';
        clearAuthData(true); // Clear admin auth data
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 500:
        message = 'A server error occurred. Please try again later.';
        break;
      default:
        // Use server-provided error message if available
        if (data && data.message) {
          message = data.message;
        }
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message || 'An unexpected error occurred';
  }
  
  // Show error toast
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  // For debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      request: error.request,
    });
  }
  
  // Return a rejected promise with the error
  return Promise.reject(error);
};

/**
 * Handle success messages consistently
 * @param {string} message - Success message to display
 */
export const showSuccessMessage = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
