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
        const items = await getCartItems(token);
        setCartItems(items);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Token expired or invalid, redirect to login
          navigate("/login");
        } else {
          console.error("Error fetching cart items:", err);
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
      await addToCart(item.id, 1, token);
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (cartItem) => cartItem.id === item.id
        );
        if (existingItem) {
          return prevItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          return [...prevItems, { ...item, quantity: 1 }];
        }
      });
    } catch (err) {
      console.error("Error adding item to cart:", err);
      alert("Failed to add item to cart.");
    }
  };

  // Handle quantity change (increase or decrease)
  const handleQuantityChange = (itemId, change) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems
        .map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, quantity: item.quantity + change };
            if (updatedItem.quantity <= 0) {
              return null; // Don't add it to the updated list if quantity is <= 0
            }
            return updatedItem;
          }
          return item;
        })
        .filter(Boolean); // Remove null items (those with quantity <= 0)

      updateLocalStorage(updatedItems); // Update localStorage
      return updatedItems;
    });
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
      .reduce((total, item) => total + item.price * item.quantity, 0)
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b pb-4"
              >
                <div className="flex items-center">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="ml-4 text-gray-500">${item.price}</p>
                </div>

                <div className="flex items-center">
                  <Button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={item.quantity <= 1}
                    variant="outlined"
                    color="primary"
                    className="mr-2"
                  >
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    variant="outlined"
                    color="primary"
                    className="ml-2"
                  >
                    +
                  </Button>

                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    variant="outlined"
                    color="error"
                    className="ml-4"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between items-center">
            <p className="font-semibold">Total: ${calculateTotal()}</p>
            <Button
              onClick={handleCheckout}
              className="bg-accent text-light py-2 px-4 rounded-md"
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCartPage;
