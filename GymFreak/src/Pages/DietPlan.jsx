import React, { useEffect, useState } from "react";
import {
  getDietPlans,
  setUserDietPlan,
  getUserDietPlan,
  removeUserDietPlan,
  deleteUserDietPlans,
} from "../api/dietPlanApi";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          Explore Diet Plans
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg text-gray-600 animate-pulse">
              Loading diet plans...
            </span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg text-red-500">{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dietPlans.map((plan) => {
              const isExpanded = expandedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => toggleExpand(plan.id)}
                  className={`rounded-xl shadow-md transition-all duration-200 border-2 cursor-pointer ${
                    selectedPlanIds.includes(plan.id)
                      ? "border-green-500"
                      : "border-transparent"
                  } bg-white hover:shadow-lg overflow-hidden`}
                >
                  {/* Header bar */}
                  <div className="bg-blue-600 text-white px-4 py-2 text-lg font-semibold">
                    {plan.name}
                  </div>

                  {/* Plan content */}
                  <div className="p-4 text-sm text-gray-700">
                    <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">
                      {plan.category}
                    </span>

                    {!isExpanded && (
                      <p className="mt-2 text-gray-600">
                        Click to view more...
                      </p>
                    )}

                    {isExpanded && (
                      <>
                        <p className="mb-2">{plan.description}</p>
                        <div>
                          <h4 className="font-semibold mb-1 text-sm">Meals:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                            {plan.meals?.map((meal, idx) => {
                              const key = `${plan.id}-${
                                meal.time || "meal"
                              }-${idx}`;
                              return (
                                <li key={key}>
                                  {typeof meal === "string" ? (
                                    meal
                                  ) : (
                                    <>
                                      {meal.time && (
                                        <strong>{meal.time}: </strong>
                                      )}
                                      {meal.meal || JSON.stringify(meal)}
                                      {meal.calories && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({meal.calories} cal)
                                        </span>
                                      )}
                                    </>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedPlanIds.includes(plan.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectPlan(plan.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>Select</span>
                          </label>
                          {selectedPlanIds.includes(plan.id) && (
                            <button
                              className="text-sm text-red-500 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSinglePlan(plan.id);
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && selectedPlanIds.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleSavePlans}
              className="py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Selected Plans"}
            </button>
            <button
              onClick={handleDeleteUserPlan}
              className="py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Deleting..." : "Remove All Diet Plans"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanPage;