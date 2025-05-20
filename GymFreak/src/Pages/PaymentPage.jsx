import React, { useState } from "react";

const PaymentPage = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Simple validation
    if (!cardNumber || !expiryDate || !cvv || !name) {
      setError("Please fill in all fields.");
      return;
    }

    // Mock success (can later integrate with a payment gateway)
    setSuccessMessage("Payment successful!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-3xl font-bold text-light text-center mb-6">
          Payment
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-sm mb-4">{successMessage}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-light text-sm mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-accent bg-primary text-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter name on card"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="cardNumber"
              className="block text-light text-sm mb-2"
            >
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full p-3 border border-accent bg-primary text-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-light text-sm mb-2"
              >
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-3 border border-accent bg-primary text-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-light text-sm mb-2">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full p-3 border border-accent bg-primary text-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="123"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-light font-bold py-3 rounded-md hover:bg-light hover:text-primary transition"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
