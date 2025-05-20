import React, { useEffect, useState } from "react";
import {
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
} from "../api/dietPlanApi";

const initialPlan = {
  name: "",
  description: "",
  category: "",
  meals: [""]
};

const AdminDietPlan = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [form, setForm] = useState(initialPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const plans = await getDietPlans();
      setDietPlans(plans);
    } catch (err) {
      setError("Failed to load diet plans");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMealChange = (idx, value) => {
    setForm((prev) => {
      const meals = [...prev.meals];
      meals[idx] = value;
      return { ...prev, meals };
    });
  };

  const addMeal = () => setForm((prev) => ({ ...prev, meals: [...prev.meals, ""] }));
  const removeMeal = (idx) => setForm((prev) => ({ ...prev, meals: prev.meals.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateDietPlan(editId, form);
      } else {
        await createDietPlan(form);
      }
      setForm(initialPlan);
      setIsEditing(false);
      setEditId(null);
      fetchPlans();
    } catch (err) {
      setError("Failed to save diet plan");
    }
    setLoading(false);
  };

  const handleEdit = (plan) => {
    setForm({
      name: plan.name,
      description: plan.description,
      category: plan.category || "",
      meals: Array.isArray(plan.meals) ? plan.meals : [],
    });
    setIsEditing(true);
    setEditId(plan.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await deleteDietPlan(id);
      fetchPlans();
    } catch (err) {
      setError("Failed to delete diet plan");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Diet Plans</h1>
      <form onSubmit={handleSubmit} className="mb-8 bg-white rounded shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-2">{isEditing ? "Edit Diet Plan" : "Add New Diet Plan"}</h2>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Diet Name"
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (e.g. Weight Loss, Muscle Gain)"
          className="border p-2 mb-2 w-full"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Diet Description"
          className="border p-2 mb-2 w-full"
          required
        />
        <div>
          <label className="block font-semibold mb-1">Meals:</label>
          {form.meals.map((meal, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={meal}
                onChange={(e) => handleMealChange(idx, e.target.value)}
                className="border p-2 flex-1"
                placeholder={`Meal #${idx + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeMeal(idx)}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={form.meals.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addMeal} className="mt-2 text-blue-500 hover:text-blue-700">
            + Add Meal
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
          disabled={loading}
        >
          {isEditing ? "Save Changes" : "Add Diet Plan"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setForm(initialPlan);
              setIsEditing(false);
              setEditId(null);
            }}
            className="ml-4 text-gray-600 hover:underline"
          >
            Cancel
          </button>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </form>
      <h2 className="text-xl font-semibold mb-4">Existing Diet Plans</h2>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-4">
          {dietPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-gray-100 p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-700 mb-1">Category: {plan.category}</p>
                <p className="mb-2">{plan.description}</p>
                <ul className="list-disc list-inside text-sm">
                  {plan.meals && plan.meals.map((meal, idx) => (
                    <li key={idx}>{meal}</li>
                  ))}
                </ul>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(plan)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded-md mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDietPlan;
