import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaWeight, FaTape, FaDumbbell, FaBullseye, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../api/axiosInstance';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Progress = () => {
  const [activeTab, setActiveTab] = useState('weight');
  const [summary, setSummary] = useState(null);
  const [weightData, setWeightData] = useState({ labels: [], data: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    weight: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'weight') {
      fetchWeightHistory();
    }
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/progress/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching progress summary:', error);
      toast.error('Failed to load progress summary');
    }
  };

  const fetchWeightHistory = async () => {
    try {
      const response = await axios.get('/progress/weight');
      const history = response.data.data;
      
      // Process data for chart
      const labels = history.map(record => 
        new Date(record.date).toLocaleDateString()
      );
      const data = history.map(record => record.weight_kg);
      
      setWeightData({ labels, data });
    } catch (error) {
      console.error('Error fetching weight history:', error);
      toast.error('Failed to load weight history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/progress/weight', {
        weight_kg: parseFloat(formData.weight),
        date: formData.date,
        notes: formData.notes
      });
      
      toast.success('Weight record added successfully');
      setShowAddForm(false);
      setFormData({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchWeightHistory();
      fetchSummary();
    } catch (error) {
      console.error('Error adding weight record:', error);
      toast.error('Failed to add weight record');
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const chartData = {
    labels: weightData.labels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightData.data,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.1
      },
    ],
  };

  const getTabClassName = (tab) => {
    return "flex items-center px-4 py-2 rounded-xl " + (
      activeTab === tab
        ? 'bg-emerald-500 text-white'
        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
    );
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Current Weight</h3>
              <p className="text-2xl text-emerald-500">{summary.current_weight} kg</p>
              <p className="text-sm text-gray-400">
                {summary.weight_change > 0 ? '+' : ''}{summary.weight_change} kg change
              </p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Workout Days</h3>
              <p className="text-2xl text-emerald-500">{summary.workout_days}</p>
              <p className="text-sm text-gray-400">Last 30 days</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Goals</h3>
              <p className="text-2xl text-emerald-500">
                {summary.completed_goals}/{summary.total_goals}
              </p>
              <p className="text-sm text-gray-400">Goals completed</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('weight')}
            className={getTabClassName('weight')}
          >
            <FaWeight className="mr-2" /> Weight
          </button>
          <button
            onClick={() => setActiveTab('measurements')}
            className={getTabClassName('measurements')}
          >
            <FaTape className="mr-2" /> Measurements
          </button>
          <button
            onClick={() => setActiveTab('exercise')}
            className={getTabClassName('exercise')}
          >
            <FaDumbbell className="mr-2" /> Exercise
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={getTabClassName('goals')}
          >
            <FaBullseye className="mr-2" /> Goals
          </button>
        </div>

        {/* Add Record Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 flex items-center px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <FaPlus className="mr-2" /> Add Record
        </button>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Weight Record</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-xl hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Chart Section */}
        {activeTab === 'weight' && !loading && (
          <div className="bg-zinc-900 p-6 rounded-xl">
            <Line options={chartOptions} data={chartData} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
