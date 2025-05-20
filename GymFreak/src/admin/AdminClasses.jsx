import React, { useState } from "react";

const AdminClasses = () => {
  const [classes, setClasses] = useState([
    {
      id: 1,
      title: "Morning Strength",
      trainer: "Alex Johnson",
      schedule: "Mon, Wed, Fri - 7:00 AM",
      capacity: 20,
    },
    {
      id: 2,
      title: "Evening Cardio Burn",
      trainer: "Emily Davis",
      schedule: "Tue, Thu - 6:00 PM",
      capacity: 15,
    },
  ]);

  const removeClass = (id) => {
    setClasses(classes.filter((cls) => cls.id !== id));
  };

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Manage Gym Classes
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-secondary rounded-md overflow-hidden text-left">
          <thead className="bg-accent text-light">
            <tr>
              <th className="py-3 px-6">Class Name</th>
              <th className="py-3 px-6">Trainer</th>
              <th className="py-3 px-6">Schedule</th>
              <th className="py-3 px-6">Capacity</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-t border-gray-700">
                <td className="py-3 px-6">{cls.title}</td>
                <td className="py-3 px-6">{cls.trainer}</td>
                <td className="py-3 px-6">{cls.schedule}</td>
                <td className="py-3 px-6">{cls.capacity}</td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => removeClass(cls.id)}
                    className="bg-red-600 hover:bg-light hover:text-primary transition px-4 py-2 rounded-md"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClasses;
