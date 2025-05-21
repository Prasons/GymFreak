import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getCartItems, addToCart, removeFromCart } from "../api/cartApi";
import { getAccessToken } from "../utils/auth";

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Fetch cart items from the backend on mount
  useEffect(() => {
    const fetchCartItems = async () => {
      // Get token using the utility function for consistency
      const token = getAccessToken();
      if (!token) {
        // If no token, redirect to login page
        navigate("/login");
        return;
      }
      try {
        const response = await getCartItems(token);
        // The response contains an object with items array and other cart info
        setCartItems(response.data.items || []);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Token expired or invalid, redirect to login
          navigate("/login");
        } else {
          console.error("Error fetching cart items:", err);
          setCartItems([]); // Ensure cartItems is always an array
        }
      }
    };

    fetchCartItems();
  }, [navigate]);

  // Update localStorage when cart changes
  const updateLocalStorage = (items) => {
    localStorage.setItem("cartItems", JSON.stringify(items));
  };

  // Handle adding item to cart via backend
  const handleAddToCart = async (item) => {
    const token = getAccessToken();
    try {
      const response = await addToCart(item.id, 1, token);
      // Update cart items from the response
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error("Error adding item to cart:", err);
      alert("Failed to add item to cart.");
    }
  };

  // Handle quantity change (increase or decrease)
  const handleQuantityChange = async (itemId, change) => {
    try {
      const token = getAccessToken();
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;
      
      const newQuantity = item.quantity + change;
      
      if (newQuantity <= 0) {
        // Remove item if quantity would be 0 or less
        const response = await removeFromCart(itemId, token);
        setCartItems(response.data.items || []);
      } else {
        // Update quantity
        const response = await updateCartItem(itemId, newQuantity, token);
        setCartItems(response.data.items || []);
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
      alert("Failed to update item quantity.");
    }
  };

  // Remove an item from the cart
  const handleRemoveItem = async (itemId) => {
    const token = getAccessToken();
    try {
      await removeFromCart(itemId, token);
      setCartItems((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== itemId);
        updateLocalStorage(updatedItems);
        return updatedItems;
      });
    } catch (err) {
      console.error("Error removing item from cart:", err);
      alert("Failed to remove item from cart.");
    }
  };

  // Calculate the total price of the cart
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const price = item.product ? item.product.price : 0;
        return total + (price * item.quantity);
      }, 0)
      .toFixed(2);
  };

  // Handle checkout process
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/payment"); // Proceed to payment page
  };

  return (
    <div className="min-h-screen bg-primary text-light">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-4xl font-bold mb-8 text-center">Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-secondary rounded-xl shadow-lg p-8">
          <p className="text-2xl text-neutral mb-6">Your cart is empty</p>
          <button 
            onClick={() => navigate('/gymequipment')}
            className="px-6 py-3 bg-accent hover:bg-accent/80 text-light rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-secondary rounded-xl shadow-lg overflow-hidden">
            <ul className="divide-y divide-neutral/10">
              {cartItems.map((item) => (
                <li key={item.id} className="p-6 hover:bg-neutral/5 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product?.image || 'https://via.placeholder.com/80'}
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="text-xl font-medium text-light mb-1">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-accent text-lg font-semibold">
                          ${item.product?.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-primary/20 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="px-4 py-2 text-light hover:bg-primary/40 rounded-l-lg transition-colors duration-200"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-light font-medium min-w-[40px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="px-4 py-2 text-light hover:bg-primary/40 rounded-r-lg transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-accent hover:text-accent/80 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      
                      <div className="w-24 text-right">
                        <span className="font-medium">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-secondary rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-medium text-light">Order Summary</h3>
              <span className="text-neutral text-lg">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-lg">
                <span className="text-neutral">Subtotal</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-light">${calculateTotal()}</span>
              </div>
              <div className="border-t border-neutral/10 pt-6 mt-6">
                <div className="flex justify-between font-medium text-xl">
                  <span className="text-light">Total</span>
                  <span className="text-accent">${calculateTotal()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-accent hover:bg-accent/80 text-light rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] active:scale-100"
            >
              Proceed to Checkout
            </button>
            
            <button 
              onClick={() => navigate('/gymequipment')}
              className="w-full text-center mt-4 text-neutral hover:text-light transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ShoppingCartPage;
