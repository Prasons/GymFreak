import React, { useState } from "react";
import { FaPlus, FaClipboardList } from "react-icons/fa";

const AdminDiet = () => {
  const [dietName, setDietName] = useState("");
  const [dietDescription, setDietDescription] = useState("");
  const [diets, setDiets] = useState([]);

  const handleCreateDiet = () => {
    if (!dietName.trim() || !dietDescription.trim()) return;

    const newDiet = {
      id: Date.now(),
      name: dietName,
      description: dietDescription,
    };

    setDiets([newDiet, ...diets]);
    setDietName("");
    setDietDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center text-blue-400 drop-shadow-md">
          🧾 Admin Diet Plan Manager
        </h2>

        {/* Form Container */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 space-y-6">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <FaPlus /> Create New Diet Plan
          </h3>

          <input
            type="text"
            className="w-full bg-gray-700 border-none rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Diet Name"
            value={dietName}
            onChange={(e) => setDietName(e.target.value)}
          />

          <textarea
            rows={5}
            className="w-full bg-gray-700 border-none rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter diet plan details..."
            value={dietDescription}
            onChange={(e) => setDietDescription(e.target.value)}
          />

          <div className="text-right">
            <button
              onClick={handleCreateDiet}
              className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-xl font-medium"
            >
              <FaPlus className="inline-block mr-2" />
              Create Diet
            </button>
          </div>
        </div>

        {/* Created Diets */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-200">
            <FaClipboardList /> Created Diet Plans
          </h3>

          {diets.length === 0 ? (
            <p className="text-gray-500 text-center italic">
              No diet plans created yet. Start by adding one above.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {diets.map((diet) => (
                <div
                  key={diet.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-5 space-y-2"
                >
                  <h4 className="text-xl font-bold text-blue-400">
                    {diet.name}
                  </h4>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {diet.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDiet;
