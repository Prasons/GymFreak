import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaSearch } from "react-icons/fa";

const dummyProducts = [
  {
    id: "eq1",
    name: "GymFreak T-Shirt",
    price: 29.99,
    description:
      "Premium cotton blend workout t-shirt with moisture-wicking technology",
    category: "Gym Merchandise",
    stock: 100,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 156,
  },
  {
    id: "eq2",
    name: "GymFreak Shaker Bottle",
    price: 14.99,
    description:
      "800ml BPA-free protein shaker with mixing ball and measurement marks",
    category: "Gym Merchandise",
    stock: 75,
    image:
      "https://images.unsplash.com/photo-1612187212937-da55dea12356?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 245,
  },
  {
    id: "eq3",
    name: "Olympic Barbell Set",
    price: 599.99,
    description: "Professional 7ft Olympic barbell with weight plates (300lbs total)",
    category: "Gym Equipment",
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: "eq4",
    name: "GymFreak Gym Bag",
    price: 39.99,
    description: "Spacious gym bag with shoe compartment and wet pocket",
    category: "Gym Merchandise",
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 312,
  },
  {
    id: "eq5",
    name: "Power Rack with Pulley",
    price: 899.99,
    description: "Commercial grade power rack with lat pulldown and cable system",
    category: "Gym Equipment",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 67,
  },
  {
    id: "eq6",
    name: "Lifting Straps",
    price: 12.99,
    description: "Heavy-duty cotton lifting straps for better grip",
    category: "Accessories",
    stock: 120,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviews: 423,
  },
  {
    id: "eq7",
    name: "GymFreak Hoodie",
    price: 49.99,
    description: "Comfortable cotton-blend hoodie with front pocket and drawstrings",
    category: "Gym Merchandise",
    stock: 60,
    image:
      "https://images.unsplash.com/photo-1556172732-c11fc45efe8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 178,
  },
  {
    id: "eq8",
    name: "Adjustable Dumbbell Set",
    price: 449.99,
    description: "5-50 lbs quick-adjust smart dumbbell pair with stand",
    category: "Gym Equipment",
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 156,
  },
  {
    id: "eq9",
    name: "Lifting Belt",
    price: 34.99,
    description: "Premium leather weightlifting belt with quick-release buckle",
    category: "Accessories",
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 245,
  },
  // Adding supplements
  {
    id: "sup1",
    name: "Whey Protein Isolate",
    price: 59.99,
    description: "Premium whey protein isolate with 27g protein per serving",
    category: "Supplements",
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 328,
  },
  {
    id: "sup2",
    name: "Pre-Workout Energy",
    price: 39.99,
    description: "Advanced pre-workout formula for enhanced performance",
    category: "Supplements",
    stock: 65,
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 245,
  },
  {
    id: "sup3",
    name: "BCAA Complex",
    price: 29.99,
    description: "Branched-chain amino acids for muscle recovery",
    category: "Supplements",
    stock: 80,
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 189,
  }
];

const GymEquipmentPage = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(dummyProducts);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (item) => {
    if (item.stock <= 0) return;
    
    // Check if adding this item would exceed available stock
    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
    const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
    
    if (currentQuantityInCart >= item.stock) {
      alert(`Sorry, only ${item.stock} ${item.name} available in stock.`);
      return;
    }
    
    addToCart(item);
    
    // Show a success message
    alert(`${item.name} added to cart!`);
  };

  const goToCart = () => {
    navigate('/shoppingcart');
  };

  const categories = [
    "All",
    ...new Set(dummyProducts.map((item) => item.category)),
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Gym Equipment & Supplements</h1>
          <button
            onClick={goToCart}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors relative"
          >
            <FaShoppingCart className="text-xl" />
            <span>Cart</span>
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-sm">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
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
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex flex-col"
            >
              <div className="relative pt-[100%]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-xl"
                />
                <span className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 text-white text-sm rounded-full">
                  ${item.price}
                </span>
              </div>
              <div className="p-4 flex-grow">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-400">{item.category}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                    item.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.stock > 10 ? `In Stock (${item.stock})` : 
                     item.stock > 0 ? `Low Stock (${item.stock} left)` : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center text-yellow-400">
                      {"★".repeat(Math.floor(item.rating))}
                      {"☆".repeat(5 - Math.floor(item.rating))}
                    </div>
                    <span className="ml-2 text-sm text-gray-400">
                      ({item.reviews})
                    </span>
                  </div>
                </div>
              </div>
              {item.stock > 0 ? (
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-b-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 bg-gray-700 text-gray-500 rounded-b-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Out of Stock
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GymEquipmentPage;
