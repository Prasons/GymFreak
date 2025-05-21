import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Mock data for development
const mockProducts = [
  {
    id: 1,
    name: 'Premium Protein Powder',
    description: 'High-quality whey protein for muscle recovery',
    price: 49.99,
    category: 'Supplements',
    image: 'https://via.placeholder.com/150',
    stock_quantity: 50
  },
  {
    id: 2,
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat for all types of exercises',
    price: 29.99,
    category: 'Equipment',
    image: 'https://via.placeholder.com/150',
    stock_quantity: 30
  },
  {
    id: 3,
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands for strength training',
    price: 24.99,
    category: 'Accessories',
    image: 'https://via.placeholder.com/150',
    stock_quantity: 45
  },
  {
    id: 4,
    name: 'Gym Gloves',
    description: 'Padded gloves for better grip and protection',
    price: 19.99,
    category: 'Accessories',
    image: 'https://via.placeholder.com/150',
    stock_quantity: 60
  },
  {
    id: 5,
    name: 'Shaker Bottle',
    description: 'BPA-free shaker for your protein shakes',
    price: 9.99,
    category: 'Accessories',
    image: 'https://via.placeholder.com/150',
    stock_quantity: 100
  }
];

// Mock API functions
const getProducts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockProducts]), 500);
  });
};

const createProduct = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct = {
        id: mockProducts.length + 1,
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        stock_quantity: parseInt(formData.get('stock_quantity')),
        image: 'https://via.placeholder.com/150'
      };
      mockProducts.push(newProduct);
      resolve(newProduct);
    }, 500);
  });
};

const deleteProduct = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProducts.findIndex(p => p.id === id);
      if (index > -1) {
        mockProducts.splice(index, 1);
      }
      resolve();
    }, 500);
  });
};

const isAdmin = () => true; // Always return true for development

import { toast } from "react-toastify";
import {
  FiTrash2,
  FiPlus,
  FiDollarSign,
  FiTag,
  FiEdit,
  FiUpload,
  FiInfo,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProducts(mockProducts); // Fallback to mock data
        setError("Using mock data for development");
        toast.info("Using mock data for development");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, image: e.target.files[0] });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Validate form
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return;
    }

    const newProductData = {
      ...newProduct,
      id: Math.max(0, ...mockProducts.map(p => p.id)) + 1,
      image: 'https://via.placeholder.com/150',
      stock_quantity: 10
    };

    try {
      setIsSubmitting(true);
      const toastId = toast.loading("Adding product...");

      // Add to mock data
      mockProducts.push(newProductData);
      setProducts([...mockProducts]);

      // Reset form
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });

      // Clear file input
      const fileInput = document.getElementById("image-upload");
      if (fileInput) fileInput.value = "";

      // Show success message
      toast.update(toastId, {
        render: "Product added successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product. Please try again.");
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const toastId = toast.loading("Deleting product...");

      // Remove from mock data
      const index = mockProducts.findIndex(p => p.id === id);
      if (index > -1) {
        mockProducts.splice(index, 1);
        setProducts([...mockProducts]);
      }

      toast.update(toastId, {
        render: "Product deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please try again.");
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            Add, edit, and manage your product catalog
          </p>
        </div>

        {/* Add Product Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiPlus className="text-indigo-600 mr-2" size={20} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Add New Product
                </h2>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center">
                <FiInfo className="mr-2" />
                {error}
              </div>
            )}

            <form
              onSubmit={handleAddProduct}
              className="space-y-4"
              encType="multipart/form-data"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium Headphones"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-400" />
                    </div>
                    <input
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="text-gray-400" />
                    </div>
                    <input
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      placeholder="e.g. Electronics, Clothing"
                      className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image *
                  </label>
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full h-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                      <div className="flex flex-col items-center justify-center">
                        <FiUpload className="text-indigo-600 mb-2" size={24} />
                        <p className="text-sm text-gray-600">
                          {newProduct.image
                            ? newProduct.image.name
                            : "Click to upload image"}
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    placeholder="Detailed product description..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewProduct({
                      name: "",
                      description: "",
                      price: "",
                      category: "",
                      image: "",
                    });
                    setError(null);
                    const fileInput = document.getElementById("image-upload");
                    if (fileInput) fileInput.value = "";
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Product Catalog
                </h2>
                <p className="text-gray-600">
                  {products.length} products available
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No products available. Add your first product above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative pb-2/3 h-48">
                      <img
                        src={`http://localhost:8080${product.image}`}
                        alt={product.name}
                        className="absolute h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {product.name}
                          </h3>
                          <p className="text-indigo-600 font-medium mt-1">
                            ${product.price}
                          </p>
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mt-2">
                            {product.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition disabled:opacity-50"
                          title="Delete product"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
