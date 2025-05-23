import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";

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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.stock > 5 ? 'bg-green-500/20 text-green-400' : 
                    item.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.stock > 5 ? 'In Stock' : item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
                <p className="text-gray-400 mb-2">{item.description}</p>
                {item.stock !== undefined && item.quantity > item.stock && (
                  <div className="flex items-center text-yellow-400 text-sm mb-2">
                    <FaExclamationTriangle className="mr-1" />
                    Only {item.stock} available (reduced from {item.quantity})
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                    >
                      <FaMinus />
                    </button>
                    <span className={`text-xl font-medium w-8 text-center ${
                      item.stock !== undefined && item.quantity > item.stock ? 'text-yellow-400' : ''
                    }`}>
                      {item.stock !== undefined && item.quantity > item.stock ? item.stock : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      className={`p-2 rounded-full transition-colors ${
                        item.stock !== undefined && item.quantity >= item.stock
                          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
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
          <div className="space-y-4">
            {cartItems.some(item => item.stock !== undefined && item.quantity > item.stock) && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm flex items-start">
                <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Inventory Adjustment</p>
                  <p>Some items in your cart have been adjusted to match available stock.</p>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/gymequipment')}
                className="flex-1 px-6 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                disabled={cartItems.some(item => item.stock !== undefined && item.stock === 0)}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                  cartItems.some(item => item.stock !== undefined && item.stock === 0)
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {cartItems.some(item => item.stock !== undefined && item.stock === 0)
                  ? 'Remove Out of Stock Items to Proceed'
                  : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
