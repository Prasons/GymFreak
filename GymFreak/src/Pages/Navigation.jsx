import { Link } from "react-router-dom";

const Navigation = ({ isAuthenticated, onLogout }) => {
  return (
    <nav
      style={{
        padding: "1rem",
        background: "#f0f0f0",
        display: "flex",
        gap: "1rem",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/gymequipment">Equipment</Link>
      <Link to="/shoppingcart">Cart</Link>

      {isAuthenticated ? (
        <>
          <Link to="/admin">Admin</Link>
          <button onClick={onLogout}>Logout</button> {/* The logout button */}
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navigation;
