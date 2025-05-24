import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaClipboardList,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUtensils,
  FaFire,
  FaDumbbell,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getAdminToken } from "../utils/auth";
import {
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  toggleDietPlanStatus,
} from "../api/dietPlanApi";
import { CheckBox } from "@mui/icons-material";

const AdminDietPlan = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "beginner",
    duration_weeks: 4,
    target_goal: "weight_loss",
    is_active:true,
    daily_calories: 2000,
    protein_grams: 150,
    carbs_grams: 200,
    fat_grams: 65,
    meals: [
      {
        meal_type: "breakfast",
        name: "",
        description: "",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
      {
        meal_type: "snack1",
        name: "",
        description: "",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
      {
        meal_type: "lunch",
        name: "",
        description: "",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
      {
        meal_type: "snack2",
        name: "",
        description: "",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
      {
        meal_type: "dinner",
        name: "",
        description: "",
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      },
    ],
  });

  const [currentPlan, setCurrentPlan] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load diet plans on component mount
  useEffect(() => {
    loadDietPlans();
  }, []);
  const loadDietPlans = async () => {
    try {
      setIsLoading(true);
      const response = await getDietPlans();
      // Check if response.data is an array, if not, try to get the data from response.data.data
      const plans = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('Loaded diet plans:', plans);
      setDietPlans(plans);
    } catch (error) {
      console.error("Error loading diet plans:", error);
      toast.error("Failed to load diet plans: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      difficulty: "beginner",
      duration_weeks: 4,
      target_goal: "weight_loss",
      daily_calories: 2000,
      protein_grams: 150,
      carbs_grams: 200,
      fat_grams: 65,
      meals: [
        {
          meal_type: "breakfast",
          name: "",
          description: "",
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
        {
          meal_type: "snack1",
          name: "",
          description: "",
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
        {
          meal_type: "lunch",
          name: "",
          description: "",
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
        {
          meal_type: "snack2",
          name: "",
          description: "",
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
        {
          meal_type: "dinner",
          name: "",
          description: "",
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
        },
      ],
    });
    setCurrentPlan(null);
    setActiveTab("details");
  };

  const handleEdit = (plan) => {
    setCurrentPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      difficulty: plan.difficulty,
      duration_weeks: plan.duration_weeks,
      target_goal: plan.target_goal,
      daily_calories: plan.daily_calories,
      protein_grams: plan.protein_grams,
      carbs_grams: plan.carbs_grams,
      fat_grams: plan.fat_grams,
      meals: plan.meals?.length
        ? plan.meals
        : [
            {
              meal_type: "breakfast",
              name: "",
              description: "",
              calories: 0,
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
            },
            {
              meal_type: "snack1",
              name: "",
              description: "",
              calories: 0,
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
            },
            {
              meal_type: "lunch",
              name: "",
              description: "",
              calories: 0,
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
            },
            {
              meal_type: "snack2",
              name: "",
              description: "",
              calories: 0,
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
            },
            {
              meal_type: "dinner",
              name: "",
              description: "",
              calories: 0,
              protein_g: 0,
              carbs_g: 0,
              fat_g: 0,
            },
          ],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this diet plan?")) {
      try {
        setIsLoading(true);
        await deleteDietPlan(id);
        setDietPlans(dietPlans.filter((plan) => plan.id !== id));
        toast.success("Diet plan deleted successfully");
      } catch (error) {
        console.error("Error deleting diet plan:", error);
        toast.error("Failed to delete diet plan");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setIsLoading(true);
      const { data } = await toggleDietPlanStatus(id);
      setDietPlans(
        dietPlans.map((plan) =>
          plan.id === id ? { ...plan, is_active: data.data.is_active } : plan
        )
      );
      toast.success(
        `Diet plan ${currentStatus ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      console.error("Error toggling diet plan status:", error);
      toast.error("Failed to update diet plan status");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalMacros = () => {
    return formData.meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (parseInt(meal.calories) || 0),
        protein: totals.protein + (parseInt(meal.protein_g) || 0),
        carbs: totals.carbs + (parseInt(meal.carbs_g) || 0),
        fat: totals.fat + (parseInt(meal.fat_g) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name.includes("_grams") ||
        name.includes("calories") ||
        name === "duration_weeks"
          ? parseInt(value) || 0
          : value,
    });

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...formData.meals];
    const newValue = field === "calories" || field.endsWith("_g")
      ? parseInt(value) || 0
      : value;

    updatedMeals[index] = {
      ...updatedMeals[index],
      [field]: newValue,
    };

    setFormData({
      ...formData,
      meals: updatedMeals,
    });

    // Clear error for this field when user types
    const errorKey = `meal_${index}_${field}`;
    if (formErrors[errorKey]) {
      const newErrors = { ...formErrors };
      delete newErrors[errorKey];
      setFormErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.difficulty) errors.difficulty = "Difficulty is required";
    if (!formData.duration_weeks || formData.duration_weeks < 1)
      errors.duration_weeks = "Duration must be at least 1 week";
    if (!formData.target_goal) errors.target_goal = "Target goal is required";
    if (!formData.daily_calories || formData.daily_calories <= 0)
      errors.daily_calories = "Daily calories must be greater than 0";
    if (formData.protein_grams < 0) errors.protein_grams = "Protein cannot be negative";
    if (formData.carbs_grams < 0) errors.carbs_grams = "Carbs cannot be negative";
    if (formData.fat_grams < 0) errors.fat_grams = "Fat cannot be negative";

    // Meal validation
    formData.meals.forEach((meal, index) => {
      if (!meal.name.trim()) {
        errors[`meal_${index}_name`] = `Meal name is required for ${meal.meal_type}`;
      }
      if (meal.calories < 0) {
        errors[`meal_${index}_calories`] = `Calories cannot be negative for ${meal.meal_type}`;
      }
      if (meal.protein_g < 0) {
        errors[`meal_${index}_protein`] = `Protein cannot be negative for ${meal.meal_type}`;
      }
      if (meal.carbs_g < 0) {
        errors[`meal_${index}_carbs`] = `Carbs cannot be negative for ${meal.meal_type}`;
      }
      if (meal.fat_g < 0) {
        errors[`meal_${index}_fat`] = `Fat cannot be negative for ${meal.meal_type}`;
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      setIsLoading(true);
      let response;

      if (currentPlan) {
        // Update existing plan
        console.log("Updating diet plan with ID:", currentPlan.id);
        response = await updateDietPlan(currentPlan.id, formData);
        console.log("Update response:", response);
        setDietPlans(
          dietPlans.map((plan) =>
            plan.id === currentPlan.id ? response.data : plan
          )
        );
        toast.success("Diet plan updated successfully");
      } else {
        // Create new plan
        console.log("Creating new diet plan");
        response = await createDietPlan(formData);
        console.log("Create response:", response);
        setDietPlans([response.data, ...dietPlans]);
        toast.success("Diet plan created successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving diet plan:", error);
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request ? 'Request made but no response' : 'No request made',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      let errorMessage = "Failed to save diet plan";
      if (error.response) {
        // Server responded with an error status code
        if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please log in as admin.";
        } else if (error.response.data) {
          errorMessage = error.response.data.message || 
                       error.response.data.error ||
                       `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check if the backend is running and accessible.";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || "Error setting up the request";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // Calculate total macros for display
  const totalMacros = calculateTotalMacros();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-400 drop-shadow-md">
          <FaUtensils className="inline-block mr-2" />
          {currentPlan ? "Edit Diet Plan" : "Create New Diet Plan"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 mb-12"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              type="button"
              className={`px-4 py-2 font-medium ${
                activeTab === "details"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Plan Details
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium ${
                activeTab === "meals"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("meals")}
            >
              Meal Plan
            </button>
            <button
              type="button"
              className={`px-4 py-2 font-medium ${
                activeTab === "nutrition"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("nutrition")}
            >
              Nutrition
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Duration (weeks) *
                  </label>
                  <input
                    type="number"
                    name="duration_weeks"
                    value={formData.duration_weeks}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Goal *
                </label>
                <select
                  name="target_goal"
                  value={formData.target_goal}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
              
            </div>
          )}

          {activeTab === "meals" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {formData.meals.map((meal, index) => (
                  <div 
                    key={index}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedMeal(expandedMeal === index ? null : index)}
                    >
                      <h4 className="font-medium text-white capitalize">
                        {meal.meal_type.replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </h4>
                      <span className="text-gray-400">
                        {expandedMeal === index ? '▲' : '▼'}
                      </span>
                    </div>
                    
                    {expandedMeal === index && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Meal Name *
                          </label>
                          <input
                            type="text"
                            value={meal.name}
                            onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={meal.description}
                            onChange={(e) => handleMealChange(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Calories (kcal)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={meal.calories}
                              onChange={(e) => handleMealChange(index, 'calories', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Protein (g)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={meal.protein_g}
                              onChange={(e) => handleMealChange(index, 'protein_g', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Carbs (g)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={meal.carbs_g}
                              onChange={(e) => handleMealChange(index, 'carbs_g', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Fat (g)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={meal.fat_g}
                              onChange={(e) => handleMealChange(index, 'fat_g', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "nutrition" && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Daily Nutrition Targets</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Daily Calories (kcal) *
                      </label>
                      <input
                        type="number"
                        name="daily_calories"
                        value={formData.daily_calories}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Protein (g) *
                        </label>
                        <input
                          type="number"
                          name="protein_grams"
                          value={formData.protein_grams}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Carbs (g) *
                        </label>
                        <input
                          type="number"
                          name="carbs_grams"
                          value={formData.carbs_grams}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>


                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Fat (g) *
                        </label>
                        <input
                          type="number"
                          name="fat_grams"
                          value={formData.fat_grams}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-4">Nutrition Summary</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Calories:</span>
                        <span className="text-white font-medium">
                          {totalMacros.calories} / {formData.daily_calories} kcal
                        </span>
                      </div>
                      
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(100, (totalMacros.calories / formData.daily_calories) * 100)}%`
                          }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-blue-400 font-medium">
                            {totalMacros.protein}g
                          </div>
                          <div className="text-xs text-gray-400">Protein</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((totalMacros.protein * 4 / totalMacros.calories) * 100) || 0}% of cals
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-green-400 font-medium">
                            {totalMacros.carbs}g
                          </div>
                          <div className="text-xs text-gray-400">Carbs</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((totalMacros.carbs * 4 / totalMacros.calories) * 100) || 0}% of cals
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-yellow-400 font-medium">
                            {totalMacros.fat}g
                          </div>
                          <div className="text-xs text-gray-400">Fat</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((totalMacros.fat * 9 / totalMacros.calories) * 100) || 0}% of cals
                          </div>
                        </div>
                      </div>


                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <button
                          type="button"
                          onClick={() => {
                            // Auto-calculate macros based on target calories
                            const protein = Math.round(formData.daily_calories * 0.3 / 4);
                            const fat = Math.round(formData.daily_calories * 0.3 / 9);
                            const carbs = Math.round((formData.daily_calories - (protein * 4 + fat * 9)) / 4);
                            
                            setFormData({
                              ...formData,
                              protein_grams: protein,
                              carbs_grams: carbs,
                              fat_grams: fat
                            });
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                          Auto-Calculate Macros
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-700 mt-8">
            <div>
              {currentPlan && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading
                  ? "Saving..."
                  : currentPlan
                  ? "Update Plan"
                  : "Create Plan"}
              </button>
            </div>
          </div>
        </form>

        {/* Diet Plans List */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-200">
            <FaClipboardList /> Diet Plans
          </h3>

          {dietPlans.length === 0 ? (
            <p className="text-gray-500 text-center italic">
              No diet plans found
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dietPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-gray-800 border rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 
                    
                     border-green-500`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-blue-400">
                        {plan.name}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                        
                      </div>
                    </div>

                    <p className="text-gray-300 mt-2 text-sm line-clamp-2">
                      {plan.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-700">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>
                          Difficulty:{" "}
                          <span className="capitalize">{plan.difficulty}</span>
                        </span>
                        <span>{plan.duration_weeks} weeks</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Goal:{" "}
                        <span className="capitalize">
                          {plan.target_goal.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDietPlan;
