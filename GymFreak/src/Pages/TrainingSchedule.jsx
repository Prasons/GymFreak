import React, { useEffect, useState } from "react";
import {
  getTrainingSchedules,
  getUserTrainingSchedules,
  enrollUserTrainingSchedules,
  unenrollUserTrainingSchedule,
  unenrollAllUserTrainingSchedules,
} from "../api/trainingScheduleApi";
import { FaCalendarAlt, FaClock, FaDumbbell, FaUserFriends, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
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
        const response = await getTrainingSchedules();
        // Handle both array response and object with data property
        const schedulesData = Array.isArray(response) ? response : (response?.data || []);
        setSchedules(schedulesData);
      } catch (err) {
        console.error("Error fetching training schedules:", err);
        setError("Failed to load training schedules");
        setSchedules([]);
      }
      setLoading(false);
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchUserSchedules = async () => {
      try {
        const response = await getUserTrainingSchedules();
        // Handle both array response and object with data property
        const userSchedulesData = Array.isArray(response) ? response : (response?.data || []);
        
        if (Array.isArray(userSchedulesData) && userSchedulesData.length > 0) {
          setUserSchedules(userSchedulesData);
          setSelectedIds(userSchedulesData.map((s) => s.id));
        } else if (userSchedulesData && typeof userSchedulesData === "object") {
          setUserSchedules([userSchedulesData]);
          setSelectedIds([userSchedulesData.id]);
        } else {
          setUserSchedules([]);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error("Error fetching user schedules:", err);
        setUserSchedules([]);
        setSelectedIds([]);
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
            <FaCalendarAlt className="mr-4 text-purple-500" />
            Training Schedules
            <FaDumbbell className="ml-4 text-purple-500" />
          </h1>
          <p className="text-gray-400 text-lg">Schedule your training sessions with expert trainers</p>
          {error && (
            <div className="mt-4 text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center text-gray-400">No training schedules available.</div>
        ) : (
          <motion.div variants={containerVariants}>
            {/* Available Schedules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {schedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  variants={itemVariants}
                  className={`relative bg-zinc-900 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300 ${selectedIds.includes(schedule.id) ? 'border-2 border-purple-500' : ''}`}
                >
                  <div className="text-center mb-8">
                    <FaUserFriends className="text-4xl text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{schedule.name}</h2>
                    <span className="inline-block bg-purple-500/20 text-purple-400 text-sm px-3 py-1 rounded-full">
                      {schedule.trainer}
                    </span>
                  </div>

                  <div className="mb-8">
                    <p className="text-gray-400 mb-4">{schedule.description}</p>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-300">
                        <FaCalendarAlt className="text-purple-500 mr-2" />
                        <span>{schedule.days && schedule.days.join(', ')}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <FaClock className="text-purple-500 mr-2" />
                        <span>{schedule.time}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-purple-500">Activities:</h3>
                        <ul className="space-y-2">
                          {schedule.activities && schedule.activities.map((activity, idx) => (
                            <li key={idx} className="flex items-center text-gray-300">
                              <FaDumbbell className="text-purple-500 mr-2" />
                              <span>{typeof activity === "string" ? activity : JSON.stringify(activity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelect(schedule.id)}
                    className={`w-full py-3 px-6 rounded-xl ${selectedIds.includes(schedule.id) ? 'bg-purple-500 hover:bg-purple-600' : 'bg-zinc-800 hover:bg-zinc-700'} text-white font-semibold transition-colors duration-200 flex items-center justify-center`}
                  >
                    {selectedIds.includes(schedule.id) ? (
                      <>
                        <FaCheck className="mr-2" /> Selected
                      </>
                    ) : (
                      'Select Schedule'
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
                onClick={handleSave}
                disabled={saving || selectedIds.length === 0}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Selected Schedules'
                )}
              </button>
            </motion.div>

            {/* Active Schedules */}
            {userSchedules.length > 0 && (
              <motion.div 
                className="mt-16"
                variants={containerVariants}
              >
                <h2 className="text-3xl font-bold mb-8 text-center">Your Active Schedules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {userSchedules.map((schedule) => (
                    <motion.div 
                      key={schedule.id} 
                      variants={itemVariants}
                      className="bg-zinc-900/50 p-8 rounded-2xl border border-purple-500/30"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-bold text-purple-500">{schedule.name}</h3>
                        <button
                          onClick={() => handleUnenroll(schedule.id)}
                          disabled={saving}
                          className="text-red-500 hover:text-red-400 transition-colors duration-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <span className="inline-block bg-purple-500/20 text-purple-400 text-sm px-3 py-1 rounded-full mb-4">
                        {schedule.trainer}
                      </span>
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center text-gray-300">
                          <FaCalendarAlt className="text-purple-500 mr-2" />
                          <span>{schedule.days && schedule.days.join(', ')}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <FaClock className="text-purple-500 mr-2" />
                          <span>{schedule.time}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 text-purple-500/80">Activities:</h4>
                        <ul className="space-y-3">
                          {schedule.activities && schedule.activities.map((activity, idx) => (
                            <li key={idx} className="flex items-center text-gray-300">
                              <FaDumbbell className="text-purple-500 mr-2" />
                              <span>{typeof activity === "string" ? activity : JSON.stringify(activity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleUnenrollAll}
                    disabled={saving}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FaTrash className="mr-2" /> Remove All Schedules
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TrainingSchedulePage;
