import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaCheck, FaBan, FaUserPlus, FaTimes, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";

// Mock data for development
const mockMembers = [
  { 
    id: 1, 
    name: "John Doe", 
    email: "john@example.com", 
    status: "Active",
    joinDate: "2023-01-15",
    membershipType: "Premium",
    lastActive: "2023-05-20",
    phone: "+1 234-567-8900",
    age: 28,
    gender: "Male",
    address: "123 Gym Street, Fitness City",
    emergencyContact: "Jane Doe (Wife) - +1 234-567-8901",
    medicalConditions: "None",
    trainer: "Mike Johnson",
    paymentStatus: "Paid",
    nextPaymentDue: "2023-06-15"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    email: "jane@example.com", 
    status: "Inactive",
    joinDate: "2023-02-20",
    membershipType: "Basic",
    lastActive: "2023-04-15",
    phone: "+1 234-567-8902",
    age: 32,
    gender: "Female",
    address: "456 Health Ave, Fitness City",
    emergencyContact: "John Smith (Husband) - +1 234-567-8903",
    medicalConditions: "Asthma",
    trainer: "Sarah Wilson",
    paymentStatus: "Due",
    nextPaymentDue: "2023-05-20"
  }
];

// Mock API functions
const mockApi = {
  getMembers: () => new Promise((resolve) => setTimeout(() => resolve([...mockMembers]), 500)),
  updateStatus: (id, status) => new Promise((resolve) => {
    const memberIndex = mockMembers.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      mockMembers[memberIndex].status = status;
    }
    setTimeout(() => resolve({ success: true }), 300);
  }),
  updateMember: (id, data) => new Promise((resolve) => {
    const memberIndex = mockMembers.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      mockMembers[memberIndex] = { ...mockMembers[memberIndex], ...data };
    }
    setTimeout(() => resolve({ success: true }), 300);
  }),
  deleteMember: (id) => new Promise((resolve) => {
    const memberIndex = mockMembers.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      mockMembers.splice(memberIndex, 1);
    }
    setTimeout(() => resolve({ success: true }), 300);
  })
};

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    membershipType: "Basic"
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await mockApi.getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members. Please try again later.");
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, status) => {
    try {
      const newStatus = status === "Active" ? "Inactive" : "Active";
      await mockApi.updateStatus(id, newStatus);
      fetchMembers();
      toast.success(`Member status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (member) => {
    setEditId(member.id);
    setEditForm({ name: member.name, email: member.email });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      await mockApi.updateMember(id, editForm);
      setEditId(null);
      fetchMembers();
      toast.success("Member updated successfully");
    } catch (error) {
      console.error("Error updating member:", error);
      setError("Failed to update member. Please try again.");
      toast.error("Failed to update member");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setProcessing(true);
    try {
      await mockApi.deleteMember(deleteId);
      fetchMembers();
      toast.success("Member deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting member:", error);
      setError("Failed to delete member. Please try again.");
      toast.error("Failed to delete member");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddMember = async (e) => {
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
      // In a real app, this would be an API call
      const newMember = {
        id: Date.now(),
        ...addForm,
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString().split("T")[0]
      };
      mockMembers.push(newMember);
      await fetchMembers();
      setShowAddModal(false);
      setAddForm({ name: "", email: "", membershipType: "Basic" });
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setProcessing(false);
    }
  };

  const filteredMembers = members
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || member.status.toLowerCase() === filterStatus.toLowerCase();
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
        <h1 className="text-3xl font-bold">Members Management</h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          onClick={() => setShowAddModal(true)}
          type="button"
        >
          <FaUserPlus />
          Add New Member
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

      {/* Members Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Email</th>
                <th className="py-4 px-6 text-left">Membership</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Join Date</th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    {editId === member.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowProfileModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {member.name}
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editId === member.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      />
                    ) : (
                      member.email
                    )}
                  </td>
                  <td className="py-4 px-6">{member.membershipType}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${member.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">{member.joinDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {editId === member.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditSave(member.id)}
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
                            onClick={() => handleEdit(member)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(member.id, member.status)}
                            className={`p-2 ${member.status === "Active" ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"} transition-colors`}
                            title={member.status === "Active" ? "Deactivate" : "Activate"}
                          >
                            {member.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(member.id);
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Member</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:text-gray-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter member name"
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
                <label className="block mb-2">Membership Type</label>
                <select
                  value={addForm.membershipType}
                  onChange={(e) => setAddForm({ ...addForm, membershipType: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Pro">Pro</option>
                </select>
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
                    'Add Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this member? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                onClick={handleDelete}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>Delete</>                  
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {showProfileModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedMember.name}'s Profile</h2>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedMember(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Email:</span> {selectedMember.email}</p>
                      <p><span className="text-gray-400">Phone:</span> {selectedMember.phone}</p>
                      <p><span className="text-gray-400">Age:</span> {selectedMember.age}</p>
                      <p><span className="text-gray-400">Gender:</span> {selectedMember.gender}</p>
                      <p><span className="text-gray-400">Address:</span> {selectedMember.address}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
                    <p>{selectedMember.emergencyContact}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Medical Information</h3>
                    <p><span className="text-gray-400">Conditions:</span> {selectedMember.medicalConditions || 'None'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Membership Details</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${selectedMember.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {selectedMember.status}
                        </span>
                      </p>
                      <p><span className="text-gray-400">Type:</span> {selectedMember.membershipType}</p>
                      <p><span className="text-gray-400">Join Date:</span> {selectedMember.joinDate}</p>
                      <p><span className="text-gray-400">Last Active:</span> {selectedMember.lastActive}</p>
                      <p><span className="text-gray-400">Trainer:</span> {selectedMember.trainer}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Payment Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${selectedMember.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {selectedMember.paymentStatus}
                        </span>
                      </p>
                      <p><span className="text-gray-400">Next Payment Due:</span> {selectedMember.nextPaymentDue}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        handleEdit(selectedMember);
                      }}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      title="Edit Member"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${selectedMember.email}`;
                      }}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                      title="Send Email"
                    >
                      <FaEnvelope size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
