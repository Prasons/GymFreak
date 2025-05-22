import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa";

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const handleCheckout = () => {
    navigate('/dashboard', { state: { activeView: 'payment' } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="mb-8">Add some items to your cart to get started!</p>
        <button
          onClick={() => navigate('/gymequipment')}
          className="px-6 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mr-6 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
        </div>
        <div className="grid gap-8">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-md"
              />
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-400 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                    >
                      <FaMinus />
                    </button>
                    <span className="text-xl font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-zinc-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl">Total:</span>
            <span className="text-2xl font-bold">${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/gymequipment')}
              className="flex-1 px-6 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 px-6 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
