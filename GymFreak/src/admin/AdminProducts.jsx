import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FiPackage,
  FiSearch,
  FiFilter
} from "react-icons/fi";

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

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock_quantity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, image: e.target.files[0] });
    } else {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ 
      ...product,
      stock_quantity: product.stock_quantity || 0 
    });
    setShowAddModal(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const productData = editingProduct || newProduct;

    // Validate form
    if (!productData.name || !productData.price || !productData.category || productData.stock_quantity === '') {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Ensure stock_quantity is a number
    const stockQuantity = parseInt(productData.stock_quantity, 10) || 0;

    try {
      setIsSubmitting(true);
      const isEditing = !!editingProduct;
      const toastId = toast.loading(isEditing ? "Updating product..." : "Adding product...");

      if (isEditing) {
        // Update existing product
        const index = mockProducts.findIndex(p => p.id === editingProduct.id);
        if (index > -1) {
          mockProducts[index] = { 
            ...editingProduct,
            price: parseFloat(editingProduct.price),
            stock_quantity: stockQuantity
          };
        }
      } else {
        // Add new product
        const newProductData = {
          ...productData,
          id: Math.max(0, ...mockProducts.map(p => p.id)) + 1,
          price: parseFloat(productData.price),
          stock_quantity: stockQuantity,
          image: 'https://via.placeholder.com/150'
        };
        mockProducts.push(newProductData);
      }

      // Update state
      setProducts([...mockProducts]);

      // Reset form and editing state
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
      });
      setEditingProduct(null);

      // Clear file input
      const fileInput = document.getElementById("image-upload");
      if (fileInput) fileInput.value = "";

      setShowAddModal(false);

      // Show success message
      toast.update(toastId, {
        render: isEditing ? "Product updated successfully!" : "Product added successfully!",
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          onClick={() => {
            setEditingProduct(null);
            setShowAddModal(true);
          }}
          type="button"
        >
          <FiPlus />
          Add New Product
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="supplements">Supplements</option>
              <option value="equipment">Equipment</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="relative pb-[100%]">
              <img 
                src={product.image} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <span className="text-blue-400 font-bold">${product.price}</span>
              </div>
              <p className="text-gray-400 text-sm mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-sm rounded-lg ${product.stock_quantity > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {product.stock_quantity > 0 ? `In Stock: ${product.stock_quantity}` : 'Out of Stock'}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg">
                  {product.category}
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
                <button
                  type="button"
                  onClick={() => handleEditProduct(product)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit"
                >
                  <FiEdit />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:text-gray-400 transition-colors"
              >
                <FiPlus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingProduct ? editingProduct.name : newProduct.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block mb-2">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    name="price"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Category</label>
                  <select
                    name="category"
                    value={editingProduct ? editingProduct.category : newProduct.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    min="0"
                    value={editingProduct ? editingProduct.stock_quantity : newProduct.stock_quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2">Product Image</label>
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full px-4 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <FiUpload className="mr-2" />
                    Choose Image
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      {editingProduct ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
