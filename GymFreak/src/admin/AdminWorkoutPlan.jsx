import React, { useEffect, useState } from "react";
import {
  getWorkoutPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from "../api/workoutPlanApi";

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
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const plans = await getWorkoutPlans();
      setWorkoutPlans(plans);
    } catch (err) {
      setError("Failed to load workout plans");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin: Workout Plans</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-semibold">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Difficulty Level</label>
            <select
              name="difficulty_level"
              value={form.difficulty_level}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-semibold">Duration (weeks)</label>
            <input
              type="number"
              name="duration_weeks"
              min="1"
              value={form.duration_weeks}
              onChange={handleNumberChange}
              className="w-full border px-3 py-2 rounded"
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
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
              Make this plan public
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
            rows="3"
            placeholder="Describe the workout plan..."
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Target Goals</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['Weight Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Flexibility', 'General Fitness'].map(goal => (
              <label key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  value={goal}
                  checked={form.target_goals.includes(goal)}
                  onChange={handleTargetGoalsChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm">{goal}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
        >
          {editingPlan ? "Update Plan" : "Create Plan"}
        </button>
        {editingPlan && (
          <button
            type="button"
            onClick={() => { setEditingPlan(null); setForm({ name: "", category: "", description: "", exercises: [] }); }}
            className="ml-4 px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>
      <h3 className="text-xl font-bold mb-4">All Workout Plans</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ul>
          {workoutPlans.map((plan) => (
            <li key={plan.id} className="mb-4 border-b pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{plan.name}</span> ({plan.category})
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="mr-2 px-3 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-gray-700 text-sm mt-1">{plan.description}</div>
              <div className="text-gray-600 text-xs mt-1">
                Exercises: {Array.isArray(plan.exercises) ? plan.exercises.join(", ") : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminWorkoutPlan;
