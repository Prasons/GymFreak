import React, { useState, useEffect } from "react";

const dummyProducts = [
  {
    id: "eq1",
    name: "Treadmill Pro 2000",
    price: 1299.99,
    description:
      "Professional grade treadmill with 3.5 HP motor and 12% incline",
    category: "Cardio",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 128,
  },
  {
    id: "eq2",
    name: "Adjustable Dumbbell Set",
    price: 349.99,
    description:
      "5-50 lbs adjustable dumbbells with quick-change weight system",
    category: "Strength",
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 245,
  },
  {
    id: "eq3",
    name: "Yoga Mat Premium",
    price: 49.99,
    description: "Eco-friendly 6mm thick yoga mat with carrying strap",
    category: "Accessories",
    stock: 37,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 189,
  },
  {
    id: "eq4",
    name: "Resistance Bands Set",
    price: 29.99,
    description: "5-piece set with different resistance levels and door anchor",
    category: "Accessories",
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviews: 312,
  },
  {
    id: "eq5",
    name: "Adjustable Bench",
    price: 199.99,
    description: "Heavy-duty adjustable weight bench with 7 back positions",
    category: "Strength",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 176,
  },
  {
    id: "eq6",
    name: "Jump Rope Pro",
    price: 19.99,
    description: "Professional speed jump rope with ball bearings",
    category: "Cardio",
    stock: 52,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    reviews: 423,
  },
];

const GymEquipmentPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(dummyProducts);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (item) => {
    setAddedItems((prev) => new Set(prev).add(item.id));
    alert(`${item.name} added to cart!`);
  };

  const categories = [
    "All",
    ...new Set(dummyProducts.map((item) => item.category)),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (loading) {
    return <div className="text-center text-white mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">Gym Equipment</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex flex-col"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-semibold text-white">
                    {item.name}
                  </h3>
                  <span className="text-lg font-bold text-emerald-400">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {item.rating}{" "}
                    <span className="text-gray-500">({item.reviews})</span>
                  </div>
                  <span>{item.stock} in stock</span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={addedItems.has(item.id)}
                  className={`w-full mt-auto py-2 px-4 rounded-md font-medium transition ${
                    addedItems.has(item.id)
                      ? "bg-green-600 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {addedItems.has(item.id) ? "Added to Cart" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GymEquipmentPage;
