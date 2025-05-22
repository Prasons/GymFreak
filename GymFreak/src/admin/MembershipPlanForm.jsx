import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import {
  createMembershipPlan,
  updateMembershipPlan
} from '../services/membershipPlanService';

const MembershipPlanForm = ({ plan, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '30',
    features: ['', '', ''],
    is_active: true,
    is_popular: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || '',
        duration_days: plan.duration_days?.toString() || '30',
        features: plan.features?.length > 0 ? [...plan.features] : ['', '', ''],
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        is_popular: plan.is_popular || false
      });
    }
  }, [plan]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.duration_days || isNaN(formData.duration_days) || parseInt(formData.duration_days) <= 0) {
      newErrors.duration_days = 'Valid duration is required';
    }
    
    const validFeatures = formData.features.filter(feature => feature.trim() !== '');
    if (validFeatures.length === 0) {
      newErrors.features = 'At least one feature is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeatureField = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        features: newFeatures
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (plan) {
        await updateMembershipPlan(plan.id, dataToSubmit);
        toast.success('Membership plan updated successfully');
      } else {
        await createMembershipPlan(dataToSubmit);
        toast.success('Membership plan created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving membership plan:', error);
      toast.error('Failed to save membership plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {plan ? 'Edit Membership Plan' : 'Create New Plan'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <FaTimes className="text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Plan Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 bg-zinc-800 border ${
              errors.name ? 'border-red-500' : 'border-zinc-700'
            } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
            placeholder="e.g., Premium Plan"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="Describe the benefits of this plan..."
          />
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 bg-zinc-800 border ${
                errors.price ? 'border-red-500' : 'border-zinc-700'
              } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
              placeholder="29.99"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-2 bg-zinc-800 border ${
                errors.duration_days ? 'border-red-500' : 'border-zinc-700'
              } rounded-xl focus:outline-none focus:border-emerald-500 transition-colors`}
              placeholder="30"
            />
            {errors.duration_days && (
              <p className="mt-1 text-sm text-red-500">{errors.duration_days}</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Features
          </label>
          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g., Access to all equipment"
                />
                <button
                  type="button"
                  onClick={() => removeFeatureField(index)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          {errors.features && (
            <p className="mt-1 text-sm text-red-500">{errors.features}</p>
          )}
          <button
            type="button"
            onClick={addFeatureField}
            className="mt-3 px-4 py-2 bg-zinc-800 text-gray-300 rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Add Feature
          </button>
        </div>

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
            />
            <span className="text-sm text-gray-300">Active</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_popular"
              checked={formData.is_popular}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
            />
            <span className="text-sm text-gray-300">Mark as Popular</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-zinc-800 text-gray-300 rounded-xl hover:bg-zinc-700 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            'Save Plan'
          )}
        </button>
      </div>
    </form>
  );
};

export default MembershipPlanForm;
