import React, { useEffect, useState } from "react";
import {
  getDietPlans,
  setUserDietPlan,
  getUserDietPlan,
  removeUserDietPlan,
  deleteUserDietPlans,
} from "../api/dietPlanApi";
import { FaAppleAlt, FaCheck, FaTimes, FaTrash, FaUtensils, FaCarrot } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const DietPlanPage = () => {
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await getDietPlans();
        const plans = Array.isArray(response) ? response : response?.data || [];
        setDietPlans(plans);
      } catch (err) {
        setError("Failed to load diet plans");
        setDietPlans([]);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchUserPlans = async () => {
      try {
        const plans = await getUserDietPlan();
        if (Array.isArray(plans)) {
          setUserPlans(plans);
          setSelectedPlanIds(plans.map((p) => p.id));
        } else if (plans && typeof plans === "object") {
          setUserPlans([plans]);
          setSelectedPlanIds([plans.id]);
        } else {
          setUserPlans([]);
          setSelectedPlanIds([]);
        }
      } catch (err) {
        // ignore
      }
    };
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
    setSaving(true);
    try {
      await setUserDietPlan(selectedPlanIds);
      const selectedPlans = dietPlans.filter((p) =>
        selectedPlanIds.includes(p.id)
      );
      setUserPlans(selectedPlans);
    } catch (err) {
      setError("Failed to save selected diet plans");
    }
    setSaving(false);
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
                  className={`relative bg-zinc-900 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300 ${selectedPlanIds.includes(plan.id) ? 'border-2 border-green-500' : ''}`}
                  onClick={() => toggleExpand(plan.id)}
                >
                  <div className="text-center mb-8">
                    <FaAppleAlt className="text-4xl text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                    <span className="inline-block bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
                      {plan.category}
                    </span>
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    {expandedPlanId === plan.id && (
                      <div>
                        <h3 className="font-semibold mb-4 text-green-500">Meals:</h3>
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
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.id);
                    }}
                    className={`w-full py-3 px-6 rounded-xl ${selectedPlanIds.includes(plan.id) ? 'bg-green-500 hover:bg-green-600' : 'bg-zinc-800 hover:bg-zinc-700'} text-white font-semibold transition-colors duration-200 flex items-center justify-center`}
                  >
                    {selectedPlanIds.includes(plan.id) ? (
                      <>
                        <FaCheck className="mr-2" /> Selected
                      </>
                    ) : (
                      'Select Plan'
                    )}
                  </button>
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
