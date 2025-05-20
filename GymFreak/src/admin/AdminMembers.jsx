import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // Use shared axios instance

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      // Use shared axios instance, which adds the correct Authorization header
      const res = await axiosInstance.get("/users");
      setMembers(Array.isArray(res.data) ? res.data : []);
      console.log("members", res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, status) => {
    try {
      const newStatus = status === "Active" ? "Inactive" : "Active";
      await axiosInstance.patch(
        `/users/${id}/status`,
        { status: newStatus }
      );
      fetchMembers();
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
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
      await axiosInstance.put(
        `/users/${id}`,
        { name: editForm.name, email: editForm.email }
      );
      setEditId(null);
      fetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);
      setError("Failed to update member. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      setError("Failed to delete member. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Manage Members</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-secondary rounded-md overflow-hidden">
          <thead className="bg-accent text-light">
            <tr>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-gray-700">
                <td className="py-3 px-6">
                  {editId === member.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="input input-bordered"
                    />
                  ) : (
                    member.name
                  )}
                </td>
                <td className="py-3 px-6">
                  {editId === member.id ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="input input-bordered"
                    />
                  ) : (
                    member.email
                  )}
                </td>
                <td className="py-3 px-6">
                  <span
                    className={`py-1 px-3 rounded-full text-sm ${
                      member.status === "Active"
                        ? "bg-green-500"
                        : member.status === "Inactive"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    } text-light`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-6 flex gap-2">
                  {editId === member.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(member.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded shadow transition"
                        title="Save"
                      >
                        <span role="img" aria-label="save">💾</span> Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-500 hover:bg-gray-700 text-white rounded shadow transition"
                        title="Cancel"
                      >
                        <span role="img" aria-label="cancel">❌</span> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition"
                        title="Edit"
                      >
                        <span role="img" aria-label="edit">✏️</span> Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(member.id, member.status)}
                        className={`flex items-center gap-1 px-3 py-1 ${member.status === "Active" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"} text-white rounded shadow transition`}
                        title="Toggle Status"
                      >
                        <span role="img" aria-label="toggle">🔄</span> {member.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded shadow transition"
                        title="Delete"
                      >
                        <span role="img" aria-label="delete">🗑️</span> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMembers;
