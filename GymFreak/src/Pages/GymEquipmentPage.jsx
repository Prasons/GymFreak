import React, { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import { getAccessToken } from "../utils/auth";

const GymEquipmentPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [addedItems, setAddedItems] = useState(new Set()); // Track added items

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (item) => {
    const token = getAccessToken();
    const productId = item.id || item._id;
    if (!productId) {
      alert("Invalid product: no ID found");
      return;
    }

    try {
      await addToCart(productId, 1, token);
      setAddedItems((prev) => new Set(prev).add(productId));
      alert("Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while data is fetching
  }

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Gym Equipment</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-secondary p-4 rounded-lg flex flex-col items-center"
          >
            <img
              src={item.image && item.image.startsWith('/uploads') ? `http://localhost:8080${item.image}` : item.image}
              alt={item.name}
              className="w-full h-40 object-cover mb-4 rounded"
              onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
            />
            <p className="font-semibold text-lg">{item.name}</p>
            <p className="text-accent text-sm">${item.price}</p>
            <button
              onClick={() => handleAddToCart(item)}
              disabled={addedItems.has(item.id)} // Disable button if already added
              className={`mt-4 bg-accent text-light py-2 px-4 rounded-md hover:bg-light hover:text-primary transition ${
                addedItems.has(item.id) ? "opacity-50" : ""
              }`}
            >
              {addedItems.has(item.id) ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GymEquipmentPage;
