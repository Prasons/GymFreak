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
        const plans = await getWorkoutPlans();
        setWorkoutPlans(plans);
      } catch (err) {
        setError("Failed to load workout plans");
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchUserPlans = async () => {
      try {
        const plans = await getUserWorkoutPlan();
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
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const handleSavePlans = async () => {
    setSaving(true);
    try {
      await setUserWorkoutPlan(selectedPlanIds);
      const selectedPlans = workoutPlans.filter((p) => selectedPlanIds.includes(p.id));
      setUserPlans(selectedPlans);
    } catch (err) {
      setError("Failed to save selected workout plans");
    }
    setSaving(false);
  };

  // Delete all user's selected workout plans
  const handleDeleteUserPlan = async () => {
    if (!window.confirm("Are you sure you want to remove all your selected workout plans?")) return;
    setSaving(true);
    try {
      await setUserWorkoutPlan([]); // This will clear all selections
      setUserPlans([]);
      setSelectedPlanIds([]);
    } catch (err) {
      setError("Failed to delete your selected workout plans");
    }
    setSaving(false);
  };

  // Remove a single workout plan from user's selection
  const handleRemoveSinglePlan = async (planId) => {
    if (!window.confirm("Remove this workout plan from your selection?")) return;
    setSaving(true);
    try {
      await removeUserWorkoutPlan(planId);
      setUserPlans((prev) => prev.filter((p) => p.id !== planId));
      setSelectedPlanIds((prev) => prev.filter((id) => id !== planId));
    } catch (err) {
      setError("Failed to remove the workout plan");
    }
    setSaving(false);
  };

  return (
    <div className="py-10 px-4 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">Explore Workout Plans</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-gray-600 animate-pulse">Loading workout plans...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      ) : null}

      {/* Always show main list if not loading/error */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {workoutPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl shadow-lg bg-white p-6 flex flex-col border-2 transition hover:scale-105 duration-150 ${selectedPlanIds.includes(plan.id) ? 'border-green-500' : 'border-transparent'}`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-700 mb-1">{plan.name}</h3>
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">{plan.category}</span>
                <p className="mb-3 text-gray-700 min-h-[48px]">{plan.description}</p>
                <div>
                  <h4 className="font-semibold mb-1 text-sm text-gray-800">Exercises:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {plan.exercises && plan.exercises.map((exercise, idx) => (
                      <li key={idx}>{typeof exercise === "string" ? exercise : JSON.stringify(exercise)}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <label className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={selectedPlanIds.includes(plan.id)}
                  onChange={() => handleSelectPlan(plan.id)}
                  disabled={saving}
                  className="mr-2"
                />
                <span className="font-semibold">{selectedPlanIds.includes(plan.id) ? "Selected" : "Select this plan"}</span>
              </label>
            </div>
          ))}
          <button
            onClick={handleSavePlans}
            disabled={saving || selectedPlanIds.length === 0}
            className="mt-6 py-2 px-4 rounded-lg w-full font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Selected Plans"}
          </button>
        </div>
      )}

      {/* Only show selected plan section if userPlan exists */}
      {userPlans && userPlans.length > 0 && (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
          <h3 className="text-2xl font-bold text-green-700 mb-2 text-center">Your Selected Workout Plans</h3>
          {userPlans.map((plan) => (
            <div key={plan.id} className="mb-4 border-b pb-4">
              <div className="mb-2 text-center">
                <span className="text-lg font-semibold">{plan.name}</span>
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{plan.category}</span>
              </div>
              <p className="mb-3 text-gray-700 text-center">{plan.description}</p>
              <div>
                <h4 className="font-semibold mb-1 text-sm text-gray-800">Exercises:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  {plan.exercises && plan.exercises.map((exercise, idx) => (
                    <li key={idx}>{typeof exercise === "string" ? exercise : JSON.stringify(exercise)}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleRemoveSinglePlan(plan.id)}
                className="mt-3 py-1 px-3 rounded bg-red-400 text-white hover:bg-red-600 text-sm font-semibold"
                disabled={saving}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleDeleteUserPlan}
            className="mt-6 py-2 px-4 rounded-lg w-full font-semibold transition bg-red-500 text-white hover:bg-red-600"
            disabled={saving}
          >
            {saving ? "Deleting..." : "Remove All Workout Plans"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanPage;
