import React, { useEffect, useState } from "react";
import {
  getDietPlans,
  setUserDietPlan,
  getUserDietPlan,
  removeUserDietPlan,
  deleteUserDietPlans,
} from "../api/dietPlanApi";
import { 
  FaAppleAlt, 
  FaCheck, 
  FaTimes, 
  FaTrash, 
  FaUtensils, 
  FaCarrot, 
  FaFire, 
  FaLeaf, 
  FaDumbbell,
  FaBolt,
  FaChartLine,
  FaClock,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaPlus
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaBalanceScale, FaRunning } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 20
    }
  }
};

const difficultyIcons = {
  beginner: <FaLeaf className="text-green-400" />,
  intermediate: <FaBolt className="text-yellow-400" />,
  advanced: <FaFire className="text-red-400" />
};

const goalIcons = {
  weight_loss: <FaChartLine className="text-blue-400" />,
  muscle_gain: <FaDumbbell className="text-purple-400" />,
  maintenance: <FaBalanceScale className="text-green-400" />,
  endurance: <FaRunning className="text-red-400" />
};

const renderStars = (difficulty) => {
  const stars = [];
  const level = {
    beginner: 1,
    intermediate: 2,
    advanced: 3
  }[difficulty] || 1;

  for (let i = 1; i <= 3; i++) {
    if (i <= level) {
      stars.push(<FaStar key={i} className="text-yellow-400 inline-block" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400 inline-block opacity-30" />);
    }
  }
  return stars;
};

const DietPlanPage = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await getDietPlans();
      // Access the data property from the response
      const responseData = response.data || {};
      // Check if the data is an array or has a data property that's an array
      const plans = Array.isArray(responseData) 
        ? responseData 
        : (Array.isArray(responseData.data) ? responseData.data : []);
      
      console.log('Fetched diet plans:', plans);
      setDietPlans(plans);
    } catch (err) {
      console.error('Error fetching diet plans:', err);
      setError("Failed to load diet plans: " + (err.response?.data?.message || err.message));
      setDietPlans([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchUserPlans = async () => {
    try {
      const response = await getUserDietPlan();
      // Access the data property from the response
      const responseData = response.data || {};
      let plans = [];
      
      if (Array.isArray(responseData)) {
        plans = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        plans = responseData.data;
      } else if (responseData && typeof responseData === 'object') {
        plans = [responseData];
      }
      
      console.log('Fetched user diet plans:', plans);
      setUserPlans(plans);
      setSelectedPlanIds(plans.map((p) => p.id));
    } catch (err) {
      console.error('Error fetching user diet plans:', err);
      setUserPlans([]);
      setSelectedPlanIds([]);
    }
  };
  useEffect(() => {
    fetchUserPlans();
  }, []);

  const handleSelectPlan = (planId) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  const handleSavePlans = async () => {
    if (selectedPlanIds.length === 0) {
      setError("Please select at least one diet plan");
      return;
    }

    setSaving(true);
    setError("");
    
    try {
      try {
        const res = await setUserDietPlan( selectedPlanIds)
        if(res) {await fetchUserPlans()}
        setError('')
      } catch (clearError) {
        console.warn('Could not clear existing plans:', clearError);
        // Continue even if clearing fails
      }

      
      
     
        toast.success("Diet plans updated successfully!");
    
    } catch (err) {
      console.error('Error saving diet plans:', err);
      setError("Failed to save selected diet plans: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUserPlan = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove all your selected diet plans?"
      )
    )
      return;
    setSaving(true);
    try {
      await deleteUserDietPlans();
      setUserPlans([]);
      setSelectedPlanIds([]);
      setError('')
    } catch (err) {
      setError("Failed to delete your selected diet plans");
    }
    setSaving(false);
  };

  const handleRemoveSinglePlan = async (planId) => {
    if (!window.confirm("Remove this diet plan from your selection?")) return;
    setSaving(true);
    try {
      await removeUserDietPlan(planId);
      setUserPlans((prev) => prev.filter((p) => p.id !== planId));
      setSelectedPlanIds((prev) => prev.filter((id) => id !== planId));
      setError('')
    } catch (err) {
      setError("Failed to remove the diet plan");
    }
    setSaving(false);
  };

  const toggleExpand = (id) => {
    setExpandedPlanId((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div 
      className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <FaCarrot className="mr-4 text-green-500" />
            Diet Plans
            <FaUtensils className="ml-4 text-amber-500" />
          </h1>
          <p className="text-gray-400 text-lg">Fuel your fitness journey with the right nutrition</p>
          {error && (
            <div className="mt-4 text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : dietPlans.length === 0 ? (
          <div className="text-center text-gray-400">No diet plans available.</div>
        ) : (
          <motion.div variants={containerVariants}>
            {/* Available Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dietPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={`relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden ${selectedPlanIds.includes(plan.id) ? 'ring-2 ring-green-500' : 'ring-1 ring-zinc-700'}`}
                  onClick={() => toggleExpand(plan.id)}
                >
                  {/* Difficulty Badge */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1 bg-zinc-800/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-300">
                      {difficultyIcons[plan.difficulty] || <FaStar className="text-yellow-400" />}
                    </span>
                    <span className="text-xs font-medium text-gray-300 ml-1">
                      {plan.difficulty?.charAt(0).toUpperCase() + plan.difficulty?.slice(1)}
                    </span>
                    <div className="ml-1">
                      {renderStars(plan.difficulty)}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {goalIcons[plan.target_goal] || <FaAppleAlt className="text-white text-2xl" />}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{plan.name}</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <span className="inline-flex items-center bg-zinc-800 text-green-400 text-xs px-3 py-1 rounded-full">
                        <FaClock className="mr-1 text-xs" />
                        {plan.duration_weeks} weeks
                      </span>
                      <span className="inline-flex items-center bg-zinc-800 text-blue-400 text-xs px-3 py-1 rounded-full">
                        <FaFire className="mr-1 text-xs" />
                        {plan.daily_calories} kcal/day
                      </span>
                    </div>
                  </div>

                  {/* Nutrition Summary */}
                  <div className="mb-6 bg-zinc-800/50 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                      <div>
                        <div className="text-sm text-green-400 font-medium">Protein</div>
                        <div className="text-white font-bold">{plan.protein_grams}g</div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-400 font-medium">Carbs</div>
                        <div className="text-white font-bold">{plan.carbs_grams}g</div>
                      </div>
                      <div>
                        <div className="text-sm text-amber-400 font-medium">Fat</div>
                        <div className="text-white font-bold">{plan.fat_grams}g</div>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2 mb-1">
                      <div 
                        className="bg-gradient-to-r from-green-500 via-blue-500 to-amber-500 h-2 rounded-full"
                        style={{
                          width: '100%',
                          backgroundSize: `${plan.protein_grams + plan.carbs_grams + plan.fat_grams}% 100%`,
                          backgroundImage: `linear-gradient(
                            to right,
                            #10b981 0%,
                            #10b981 ${plan.protein_grams}%,
                            #3b82f6 ${plan.protein_grams}%,
                            #3b82f6 ${plan.protein_grams + plan.carbs_grams}%,
                            #f59e0b ${plan.protein_grams + plan.carbs_grams}%,
                            #f59e0b 100%
                          )`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{plan.description}</p>
                    {expandedPlanId === plan.id && (
                      <div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Daily Meal Plan</h4>
                          <ul className="space-y-4">
                            {plan.meals?.map((meal, idx) => {
                              const key = `${plan.id}-${meal.time || "meal"}-${idx}`;
                              return (
                                <li key={key} className="bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/70 transition-colors duration-200">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-green-500/10 p-2 rounded-lg flex-shrink-0">
                                      <FaUtensils className="text-green-400 text-lg" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-white">
                                          {meal.time || 'Meal'} • {meal.name || 'Unnamed Meal'}
                                        </h4>
                                        {meal.calories > 0 && (
                                          <span className="text-xs bg-zinc-700 text-green-400 px-2 py-1 rounded-full">
                                            {meal.calories} cal
                                          </span>
                                        )}
                                      </div>
                                      {meal.description && (
                                        <p className="text-sm text-gray-400 mt-1">{meal.description}</p>
                                      )}
                                      {(meal.protein_g > 0 || meal.carbs_g > 0 || meal.fat_g > 0) && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                          {meal.protein_g > 0 && (
                                            <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                                              {meal.protein_g}g protein
                                            </span>
                                          )}
                                          {meal.carbs_g > 0 && (
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                                              {meal.carbs_g}g carbs
                                            </span>
                                          )}
                                          {meal.fat_g > 0 && (
                                            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                                              {meal.fat_g}g fat
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan.id);
                      }}
                      className={`w-full py-3 px-6 rounded-xl ${
                        selectedPlanIds.includes(plan.id)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                          : 'bg-zinc-800 hover:bg-zinc-700/80'
                      } text-white font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-green-500/10`}
                    >
                      {selectedPlanIds.includes(plan.id) ? (
                        <>
                          <FaCheck className="mr-2" /> Selected
                        </>
                      ) : (
                        <>
                          <FaPlus className="mr-2" /> Add to My Plans
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <motion.div 
              className="mt-12 flex flex-wrap gap-4 justify-center"
              variants={itemVariants}
            >
              <button
                onClick={handleSavePlans}
                disabled={saving || selectedPlanIds.length === 0}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Selected Plans'
                )}
              </button>
              {userPlans.length > 0 && (
                <button
                  onClick={handleDeleteUserPlan}
                  disabled={saving}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FaTrash className="mr-2" /> Remove All Plans
                </button>
              )}
            </motion.div>

            {/* Active Plans */}
            {userPlans.length > 0 && (
              <motion.div 
                className="mt-16"
                variants={containerVariants}
              >
                <h2 className="text-3xl font-bold mb-8 text-center">Your Active Diet Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userPlans.map((plan) => (
                    <motion.div 
                      key={plan.id} 
                      variants={itemVariants}
                      className="bg-zinc-900/50 p-8 rounded-2xl border border-green-500/30"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-bold text-green-500">{plan.name}</h3>
                        <button
                          onClick={() => handleRemoveSinglePlan(plan.id)}
                          disabled={saving}
                          className="text-red-500 hover:text-red-400 transition-colors duration-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <span className="inline-block bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full mb-4">
                        {plan.category}
                      </span>
                      <p className="text-gray-400 mb-6">{plan.description}</p>
                      <div>
                        <h4 className="font-semibold mb-4 text-green-500/80">Meals:</h4>
                        <ul className="space-y-3">
                          {plan.meals?.map((meal, idx) => {
                            const key = `${plan.id}-${meal.time || "meal"}-${idx}`;
                            return (
                              <li key={key} className="flex items-start text-gray-300 space-x-3">
                                <FaUtensils className="text-green-500 mt-1 flex-shrink-0" />
                                <div>
                                  {typeof meal === "string" ? (
                                    meal
                                  ) : (
                                    <>
                                      {meal.time && (
                                        <span className="text-green-400 font-semibold">{meal.time}: </span>
                                      )}
                                      <span>{meal.meal || JSON.stringify(meal)}</span>
                                      {meal.calories && (
                                        <span className="text-sm text-green-500/70 ml-2">
                                          {meal.calories} cal
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DietPlanPage;
