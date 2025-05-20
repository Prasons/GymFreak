import React, { useEffect, useState } from "react";
import {
  getTrainingSchedules,
  getUserTrainingSchedules,
  enrollUserTrainingSchedules,
  unenrollUserTrainingSchedule,
  unenrollAllUserTrainingSchedules,
} from "../api/trainingScheduleApi";

const TrainingSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [userSchedules, setUserSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const data = await getTrainingSchedules();
        setSchedules(data);
      } catch (err) {
        setError("Failed to load training schedules");
      }
      setLoading(false);
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchUserSchedules = async () => {
      try {
        const data = await getUserTrainingSchedules();
        if (Array.isArray(data)) {
          setUserSchedules(data);
          setSelectedIds(data.map((s) => s.id));
        } else if (data && typeof data === "object") {
          setUserSchedules([data]);
          setSelectedIds([data.id]);
        } else {
          setUserSchedules([]);
          setSelectedIds([]);
        }
      } catch {
        // ignore
      }
    };
    fetchUserSchedules();
  }, []);

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await enrollUserTrainingSchedules(selectedIds);
      const selected = schedules.filter((s) => selectedIds.includes(s.id));
      setUserSchedules(selected);
    } catch (err) {
      setError("Failed to enroll in schedules");
    }
    setSaving(false);
  };

  const handleUnenrollAll = async () => {
    if (!window.confirm("Remove all enrolled training schedules?")) return;
    setSaving(true);
    try {
      await unenrollAllUserTrainingSchedules();
      setUserSchedules([]);
      setSelectedIds([]);
    } catch (err) {
      setError("Failed to unenroll");
    }
    setSaving(false);
  };

  const handleUnenroll = async (id) => {
    if (!window.confirm("Unenroll from this schedule?")) return;
    setSaving(true);
    try {
      await unenrollUserTrainingSchedule(id);
      setUserSchedules((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    } catch (err) {
      setError("Failed to unenroll");
    }
    setSaving(false);
  };

  return (
    <div className="py-10 px-4 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">Training Schedules</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-gray-600 animate-pulse">Loading schedules...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      ) : null}

      {/* List of all schedules */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`rounded-xl shadow-lg bg-white p-6 flex flex-col border-2 transition hover:scale-105 duration-150 ${selectedIds.includes(schedule.id) ? 'border-green-500' : 'border-transparent'}`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-700 mb-1">{schedule.name}</h3>
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">{schedule.trainer}</span>
                <p className="mb-3 text-gray-700 min-h-[48px]">{schedule.description}</p>
                <div>
                  <h4 className="font-semibold mb-1 text-sm text-gray-800">Days/Time:</h4>
                  <div className="text-gray-600 text-sm mb-2">{schedule.days && schedule.days.join(', ')} | {schedule.time}</div>
                  <h4 className="font-semibold mb-1 text-sm text-gray-800">Activities:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {schedule.activities && schedule.activities.map((a, idx) => (
                      <li key={idx}>{typeof a === "string" ? a : JSON.stringify(a)}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <label className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(schedule.id)}
                  onChange={() => handleSelect(schedule.id)}
                  disabled={saving}
                  className="mr-2"
                />
                <span className="font-semibold">{selectedIds.includes(schedule.id) ? "Selected" : "Select this schedule"}</span>
              </label>
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving || selectedIds.length === 0}
            className="mt-6 py-2 px-4 rounded-lg w-full font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Selected Schedules"}
          </button>
        </div>
      )}

      {/* User's enrolled schedules */}
      {userSchedules && userSchedules.length > 0 && (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
          <h3 className="text-2xl font-bold text-green-700 mb-2 text-center">Your Enrolled Training Schedules</h3>
          {userSchedules.map((schedule) => (
            <div key={schedule.id} className="mb-4 border-b pb-4">
              <div className="mb-2 text-center">
                <span className="text-lg font-semibold">{schedule.name}</span>
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">{schedule.trainer}</span>
              </div>
              <p className="mb-3 text-gray-700 text-center">{schedule.description}</p>
              <div>
                <h4 className="font-semibold mb-1 text-sm text-gray-800">Days/Time:</h4>
                <div className="text-gray-600 text-sm mb-2">{schedule.days && schedule.days.join(', ')} | {schedule.time}</div>
                <h4 className="font-semibold mb-1 text-sm text-gray-800">Activities:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  {schedule.activities && schedule.activities.map((a, idx) => (
                    <li key={idx}>{typeof a === "string" ? a : JSON.stringify(a)}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleUnenroll(schedule.id)}
                className="mt-3 py-1 px-3 rounded bg-red-400 text-white hover:bg-red-600 text-sm font-semibold"
                disabled={saving}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={handleUnenrollAll}
            className="mt-6 py-2 px-4 rounded-lg w-full font-semibold transition bg-red-500 text-white hover:bg-red-600"
            disabled={saving}
          >
            {saving ? "Deleting..." : "Remove All Schedules"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainingSchedulePage;
