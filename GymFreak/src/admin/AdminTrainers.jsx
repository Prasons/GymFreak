import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaCheck, FaBan, FaUserPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { changeTrainerStatus, deleteTrainer, getAllTrainers, registerTrainer, updateTrainer } from "../api/trainers";

// Mock data for development
const mockTrainers = [
  {
    id: 1,
    name: "Alex Johnson",
    specialty: "Strength Training",
    email: "alex@trainer.com",
    status: "Active",
    joinDate: "2023-01-10",
    experience: "5 years"
  },
  {
    id: 2,
    name: "Emily Davis",
    specialty: "Cardio & Endurance",
    email: "emily@trainer.com",
    status: "Inactive",
    joinDate: "2023-02-15",
    experience: "3 years"
  }
];

// Mock API functions
const mockApi = {
  getTrainers: () => getAllTrainers(),
  updateStatus: (id, status) => changeTrainerStatus(id, status),
  updateTrainer: (id, data) => updateTrainer(id, data),
  deleteTrainer: (id) => deleteTrainer(id),
  addTrainer:(trainerData) => registerTrainer(trainerData),
};

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", specialty: "", experience: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    specialty: "",
    experience: ""
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await mockApi.getTrainers();
      setTrainers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching trainers:", err);
      setError("Failed to load trainers. Please try again later.");
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, status) => {
    try {
      const newStatus = status === "Active" ? "Inactive" : "Active";
      await mockApi.updateStatus(id, newStatus);
      fetchTrainers();
      toast.success(`Trainer status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (trainer) => {
    setEditId(trainer.id);
    setEditForm({
      name: trainer.name,
      email: trainer.email,
      specialty: trainer.specialty,
      experience: trainer.experience
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      await mockApi.updateTrainer(id, editForm);
      setEditId(null);
      fetchTrainers();
      toast.success("Trainer updated successfully");
    } catch (error) {
      console.error("Error updating trainer:", error);
      setError("Failed to update trainer. Please try again.");
      toast.error("Failed to update trainer");
    }
  };
 

  const handleDelete = async () => {
    if (!deleteId) return;
    setProcessing(true);
    try {
      await mockApi.deleteTrainer(deleteId);
      fetchTrainers();
      toast.success("Trainer deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting trainer:", error);
      setError("Failed to delete trainer. Please try again.");
      toast.error("Failed to delete trainer");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setProcessing(true);
    try {
      await mockApi.addTrainer({...addForm,status:'Active'});
      await fetchTrainers();
      setShowAddModal(false);
      setAddForm({ name: "", email: "", specialty: "", experience: "" });
      toast.success("Trainer added successfully");
    } catch (error) {
      console.error("Error adding trainer:", error);
      toast.error("Failed to add trainer");
    } finally {
      setProcessing(false);
    }
  };

  const filteredTrainers = trainers
    .filter(trainer => {
      const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trainer.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || trainer.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">{error}</div>
  );

  return (
    <div className="h-full bg-gray-900 text-white p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Trainers Management</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          onClick={() => setShowAddModal(true)}
          type="button"
        >
          <FaUserPlus />
          Add New Trainer
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Email</th>
                <th className="py-4 px-6 text-left">Specialty</th>
                <th className="py-4 px-6 text-left">Experience</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Join Date</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    {editId === trainer.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1 bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      trainer.name
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editId === trainer.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1 bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      trainer.email
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editId === trainer.id ? (
                      <input
                        type="text"
                        name="specialty"
                        value={editForm.specialty}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1 bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      trainer.specialty
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editId === trainer.id ? (
                      <input
                        type="text"
                        name="experience"
                        value={editForm.experience}
                        onChange={handleEditChange}
                        className="w-full px-3 py-1 bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      trainer.experience
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${trainer.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {trainer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">{trainer.joinDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {editId === trainer.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditSave(trainer.id)}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                            title="Save"
                          >
                            <FaCheck />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditId(null)}
                            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                            title="Cancel"
                          >
                            <FaBan />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(trainer)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(trainer.id, trainer.status)}
                            className={`p-2 ${trainer.status === "Active" ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"} transition-colors`}
                            title={trainer.status === "Active" ? "Deactivate" : "Activate"}
                          >
                            {trainer.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(trainer.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Trainer</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:text-gray-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddTrainer} className="space-y-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter trainer name"
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block mb-2">Specialty</label>
                <input
                  type="text"
                  value={addForm.specialty}
                  onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter specialty"
                />
              </div>
              <div>
                <label className="block mb-2">Experience</label>
                <input
                  type="text"
                  value={addForm.experience}
                  onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter years of experience"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Trainer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Confirm Delete</h2>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="p-2 hover:text-gray-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete this trainer? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Trainer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainers;
