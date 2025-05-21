import React, { useEffect, useState } from "react";
import {
  getWorkoutPlans,
  setUserWorkoutPlan,
  getUserWorkoutPlan,
  removeUserWorkoutPlan,
} from "../api/workoutPlanApi";

const WorkoutPlanPage = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");



  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await getWorkoutPlans();
        const plans = Array.isArray(response) ? response : response?.data || [];
        setWorkoutPlans(plans);
      } catch {
        setError("Failed to load workout plans");
        setWorkoutPlans([]);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.userInfo)
    const fetchUserPlans = async () => {
      try {
        const plans = await getUserWorkoutPlan(userInfo.id);
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
      } catch {
        // ignore errors
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
      const userInfo = JSON.parse(localStorage.userInfo)
      await setUserWorkoutPlan(userInfo.id,selectedPlanIds);
      setUserPlans(workoutPlans.filter((p) => selectedPlanIds.includes(p.id)));
      setError("");
    } catch {
      setError("Failed to save your workout plans.");
    }
    setSaving(false);
  };

  const handleDeleteUserPlan = async () => {
    if (
      !window.confirm("Are you sure you want to remove all your workout plans?")
    )
      return;
    setSaving(true);
    try {
      await setUserWorkoutPlan([]);
      setUserPlans([]);
      setSelectedPlanIds([]);
      setError("");
    } catch {
      setError("Failed to remove workout plans.");
    }
    setSaving(false);
  };

  const handleRemoveSinglePlan = async (planId) => {
    if (!window.confirm("Remove this workout plan?")) return;
    setSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.userInfo)
      await removeUserWorkoutPlan(userInfo.id,planId);
      setUserPlans((prev) => prev.filter((p) => p.id !== planId));
      setSelectedPlanIds((prev) => prev.filter((id) => id !== planId));
      setError("");
    } catch {
      setError("Failed to remove this workout plan.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center text-green-800 mb-10">
        Your Workout Plans
      </h1>

      {error && (
        <div className="mb-6 text-center text-red-600 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="text-gray-500 text-lg animate-pulse">
            Loading workout plans...
          </span>
        </div>
      ) : (
        <>
          {/* All Plans Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">
              Available Plans
            </h2>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {workoutPlans.length === 0 && (
                <p className="text-center col-span-full text-gray-600">
                  No workout plans found.
                </p>
              )}
              {workoutPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border-4 transition-transform duration-200
                    ${
                      selectedPlanIds.includes(plan.id)
                        ? "border-green-500 scale-105"
                        : "border-transparent hover:shadow-lg"
                    }`}
                >
                  <div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-green-700 font-medium mb-1 capitalize">
                      {plan.category}
                    </p>
                    <p className="text-gray-700 mb-4 min-h-[70px]">
                      {plan.description}
                    </p>

                    <h4 className="font-semibold text-green-800 mb-2">
                      Target Goals:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 max-h-28 overflow-y-auto">
                      {plan.target_goals && plan.target_goals.length > 0 ? (
                        plan.target_goals.map((ex) => (
                          <li
                            key={
                              typeof ex === "string" ? ex : JSON.stringify(ex)
                            }
                          >
                            {typeof ex === "string" ? ex : JSON.stringify(ex)}
                          </li>
                        ))
                      ) : (
                        <li className="italic text-gray-400">
                          No target_goals listed
                        </li>
                      )}
                    </ul>
                  </div>

                  <label className="mt-5 flex items-center space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedPlanIds.includes(plan.id)}
                      onChange={() => handleSelectPlan(plan.id)}
                      disabled={saving}
                      className="w-5 h-5 rounded border-green-500 accent-green-600"
                    />
                    <span className="font-semibold text-green-800">
                      {selectedPlanIds.includes(plan.id)
                        ? "Selected"
                        : "Select Plan"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleSavePlans}
                disabled={saving || selectedPlanIds.length === 0}
                className={`inline-block rounded-md py-3 px-10 font-semibold text-white transition-colors duration-200 ${
                  saving || selectedPlanIds.length === 0
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {saving ? "Saving..." : "Save Selected Plans"}
              </button>
            </div>
          </section>

          {/* Selected Plans Section */}
          {userPlans.length > 0 && (
            <section className="bg-white rounded-xl shadow-lg p-8 border-l-8 border-green-500">
              <h2 className="text-3xl font-extrabold text-green-800 mb-6 text-center">
                Your Selected Workout Plans
              </h2>
              <div className="space-y-8">
                {userPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border-b border-green-200 pb-5 last:border-none"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-green-900">
                          {plan.name}
                        </h3>
                        <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full capitalize">
                          {plan.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSinglePlan(plan.id)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-800 font-semibold focus:outline-none"
                        aria-label={`Remove ${plan.name}`}
                        title="Remove plan"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-gray-700 mb-4">{plan.description}</p>

                    <h4 className="font-semibold text-green-800 mb-2">
                      Target Goals:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm max-h-28 overflow-y-auto space-y-1">
                      {plan.target_goals && plan.target_goals.length > 0 ? (
                        plan.target_goals.map((ex) => (
                          <li
                            key={
                              typeof ex === "string" ? ex : JSON.stringify(ex)
                            }
                          >
                            {typeof ex === "string" ? ex : JSON.stringify(ex)}
                          </li>
                        ))
                      ) : (
                        <li className="italic text-gray-400">
                          No Target Goals listed
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={handleDeleteUserPlan}
                  disabled={saving}
                  className={`inline-block rounded-md py-3 px-12 font-semibold text-white transition-colors duration-200 ${
                    saving
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {saving ? "Removing..." : "Remove All Plans"}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutPlanPage;
