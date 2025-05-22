import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaStar, FaClock, FaDollarSign, FaCheck } from 'react-icons/fa';
import {
  getMembershipPlans,
  deleteMembershipPlan,
  toggleMembershipPlanStatus
} from '../services/membershipPlanService';
import MembershipPlanForm from './MembershipPlanForm';

const AdminMembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getMembershipPlans(!showInactive);
      setPlans(response.data || []);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [showInactive]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteMembershipPlan(id);
        toast.success('Membership plan deleted successfully');
        fetchPlans();
      } catch (error) {
        console.error('Error deleting membership plan:', error);
        toast.error('Failed to delete membership plan');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleMembershipPlanStatus(id);
      toast.success(response.message);
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Failed to update plan status');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleFormSubmit = () => {
    fetchPlans();
    handleFormClose();
  };

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Membership Plans</h1>
            <p className="text-gray-400">Manage your gym's membership plans</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                showInactive 
                  ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700' 
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {showInactive ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <FaPlus />
              <span>Add Plan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-zinc-900 rounded-2xl p-6 relative ${
                !plan.is_active && 'opacity-75'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 -right-3 bg-amber-500 text-black font-bold px-4 py-1 rounded-full flex items-center gap-2">
                  <FaStar />
                  Popular
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(plan.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      plan.is_active 
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                        : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                    }`}
                  >
                    {plan.is_active ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-emerald-500">
                  <FaDollarSign className="text-lg" />
                  <span className="text-2xl font-bold">${plan.price}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaClock />
                  <span>{plan.duration_days} days</span>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300">
                    <FaCheck className="text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Membership Plan Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MembershipPlanForm
              plan={editingPlan}
              onClose={handleFormClose}
              onSuccess={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembershipPlans;
