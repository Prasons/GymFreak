import { Link } from "react-router-dom";
import { FaDumbbell, FaShoppingCart, FaUserShield, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

const Navigation = ({ isAuthenticated, onLogout }) => {
  return (
    <nav className="bg-secondary py-3 px-6 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-full">
            <FaDumbbell className="text-2xl text-light" />
          </div>
          <span className="text-xl font-bold text-light tracking-wide">GymFreak</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-8">
            <Link 
              to="/gymequipment" 
              className="flex items-center space-x-2 text-light hover:text-accent transition-colors duration-200"
            >
              <FaDumbbell className="text-lg" />
              <span>Equipment</span>
            </Link>
            
            <Link 
              to="/shoppingcart" 
              className="flex items-center space-x-2 text-light hover:text-accent transition-colors duration-200"
            >
              <FaShoppingCart className="text-lg" />
              <span>Cart</span>
            </Link>

            {isAuthenticated && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-light hover:text-accent transition-colors duration-200"
              >
                <FaUserShield className="text-lg" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Auth Section */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent/90 text-light rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          ) : (
            <Link 
              to="/login"
              className="flex items-center space-x-2 px-4 py-2 bg-accent hover:bg-accent/90 text-light rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FaSignInAlt className="text-lg" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
