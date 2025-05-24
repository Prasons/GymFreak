import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiCheck, FiInfo } from "react-icons/fi";
import { getWorkoutPlans,updateWorkoutPlan,deleteWorkoutPlan,createWorkoutPlan } from "../api/workoutPlanApi";
// Mock data for workout plans


// Mock API functions



const AdminWorkoutPlan = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    difficulty_level: "beginner", 
    duration_weeks: 4,
    target_goals: [],
    is_public: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlans();
    console.log('dd')
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await getWorkoutPlans();
      console.log(data)
      setWorkoutPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setError("Failed to load workout plans");
      toast.error("Failed to load workout plans");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleTargetGoalsChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      target_goals: checked
        ? [...prev.target_goals, value]
        : prev.target_goals.filter(goal => goal !== value)
    }));
  };

  const handleExercisesChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, exercises: value.split("\n").map((line) => line.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updateWorkoutPlan(editingPlan.id, form);
      } else {
        await createWorkoutPlan(form);
      }
      setForm({ 
        name: "", 
        description: "", 
        difficulty_level: "beginner", 
        duration_weeks: 4,
        target_goals: [],
        is_public: true
      });
      setEditingPlan(null);
      fetchPlans();
    } catch (err) {
      console.error("Error saving workout plan:", err);
      setError(err.response?.data?.message || "Failed to save workout plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      description: plan.description || "",
      difficulty_level: plan.difficulty_level || "beginner",
      duration_weeks: plan.duration_weeks || 4,
      target_goals: Array.isArray(plan.target_goals) ? plan.target_goals : [],
      is_public: plan.is_public !== undefined ? plan.is_public : true
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout plan?")) return;
    try {
      await deleteWorkoutPlan(id);
      fetchPlans();
    } catch (err) {
      setError("Failed to delete workout plan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Workout Plans Management</h1>
          <p className="text-gray-300 mt-2">Create and manage workout plans for your members</p>
        </div>
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-lg rounded-xl p-6 mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter plan name"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Difficulty Level</label>
            <select
              name="difficulty_level"
              value={form.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Duration (weeks)</label>
            <input
              type="number"
              name="duration_weeks"
              min="1"
              value={form.duration_weeks}
              onChange={handleNumberChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 4"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={form.is_public}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-300">
              Make this plan public
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
            placeholder="Provide a detailed description of the workout plan..."
          ></textarea>
        </div>
        
        <div className="mb-8">
          <label className="block mb-3 text-sm font-medium text-gray-300">Target Goals</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'].map(goal => (
              <label key={goal} className="flex items-center">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    value={goal}
                    checked={form.target_goals.includes(goal)}
                    onChange={handleTargetGoalsChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-2 transition-colors ${
                    form.target_goals.includes(goal) 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-500 hover:border-gray-400'
                  }`}>
                    {form.target_goals.includes(goal) && <FiCheck className="text-white text-sm" />}
                  </div>
                </div>
                <span className="text-gray-300 text-sm">{goal}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setEditingPlan(null);
              setForm({ 
                name: "", 
                description: "", 
                difficulty_level: "beginner", 
                duration_weeks: 4,
                target_goals: [],
                is_public: true
              });
            }}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {editingPlan ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </form>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">All Workout Plans</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <FiInfo className="mr-2" />
            {error}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workoutPlans.map((plan) => (
            <div key={plan.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <span className="inline-block px-2 py-1 mt-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                      {plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <p className="mt-3 text-gray-300 text-sm">
                  {plan.description || 'No description provided'}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Duration: {plan.duration_weeks} weeks</span>
                    <span className="text-green-400">
                      {plan.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  
                  {plan.target_goals && plan.target_goals.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-400 mb-1">GOALS</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.target_goals.map((goal, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminWorkoutPlan;