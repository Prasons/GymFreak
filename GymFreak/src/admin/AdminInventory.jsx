import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiPackage, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

// Mock data - in a real app, this would come from your backend
const mockInventory = [
  {
    id: "eq1",
    name: "GymFreak T-Shirt",
    sku: "GF-TS-001",
    category: "Gym Merchandise",
    stock: 100,
    reorderPoint: 20,
    unitPrice: 29.99,
    supplier: "GymFreak Apparel",
    lastRestocked: "2025-04-15"
  },
  {
    id: "sup1",
    name: "Whey Protein Isolate",
    sku: "GF-WPI-001",
    category: "Supplements",
    stock: 50,
    reorderPoint: 15,
    unitPrice: 59.99,
    supplier: "Nutrition Plus",
    lastRestocked: "2025-05-01",
    expiryDate: "2026-05-01"
  }
];

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    stock: "",
    reorderPoint: "",
    unitPrice: "",
    supplier: "",
    expiryDate: ""
  });

  useEffect(() => {
    // Simulate API call
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        setTimeout(() => {
          setInventory(mockInventory);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error("Failed to load inventory");
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.name || !formData.sku || !formData.category || !formData.stock) {
        toast.error("Please fill in all required fields");
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        ...formData,
        stock: parseInt(formData.stock),
        reorderPoint: parseInt(formData.reorderPoint),
        unitPrice: parseFloat(formData.unitPrice),
        lastRestocked: new Date().toISOString().split('T')[0]
      };

      setInventory([...inventory, newItem]);
      setShowAddModal(false);
      setFormData({
        name: "",
        sku: "",
        category: "",
        stock: "",
        reorderPoint: "",
        unitPrice: "",
        supplier: "",
        expiryDate: ""
      });
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();

    try {
      const updatedInventory = inventory.map(item => 
        item.id === currentItem.id 
          ? { 
              ...item, 
              ...formData,
              stock: parseInt(formData.stock),
              reorderPoint: parseInt(formData.reorderPoint),
              unitPrice: parseFloat(formData.unitPrice)
            }
          : item
      );

      setInventory(updatedInventory);
      setShowEditModal(false);
      setCurrentItem(null);
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock.toString(),
      reorderPoint: item.reorderPoint.toString(),
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier,
      expiryDate: item.expiryDate || ""
    });
    setShowEditModal(true);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(inventory.map(item => item.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          onClick={() => setShowAddModal(true)}
          type="button"
        >
          <FiPlus />
          Add New Item
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or supplier..."
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
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">SKU</th>
                <th className="py-4 px-6 text-left">Category</th>
                <th className="py-4 px-6 text-left">Stock</th>
                <th className="py-4 px-6 text-left">Unit Price</th>
                <th className="py-4 px-6 text-left">Supplier</th>
                <th className="py-4 px-6 text-left">Last Restocked</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">{item.name}</td>
                  <td className="py-4 px-6">{item.sku}</td>
                  <td className="py-4 px-6">{item.category}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`${
                        item.stock <= item.reorderPoint ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {item.stock}
                      </span>
                      {item.stock <= item.reorderPoint && (
                        <FiAlertCircle className="text-red-400" title="Low stock" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">${item.unitPrice}</td>
                  <td className="py-4 px-6">{item.supplier}</td>
                  <td className="py-4 px-6">{item.lastRestocked}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {showAddModal ? "Add New Item" : "Edit Item"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setCurrentItem(null);
                }}
                className="p-2 hover:text-gray-400 transition-colors"
              >
                <FiPlus className="rotate-45" />
              </button>
            </div>
            <form onSubmit={showAddModal ? handleAddItem : handleEditItem} className="space-y-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Gym Equipment">Gym Equipment</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Gym Merchandise">Gym Merchandise</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block mb-2">Reorder Point</label>
                <input
                  type="number"
                  name="reorderPoint"
                  value={formData.reorderPoint}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block mb-2">Unit Price</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-2">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {formData.category === "Supplements" && (
                <div>
                  <label className="block mb-2">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setCurrentItem(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {showAddModal ? "Add Item" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
