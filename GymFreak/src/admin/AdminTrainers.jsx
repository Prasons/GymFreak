import React, { useState } from "react";

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      specialty: "Strength Training",
      email: "alex@trainer.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Emily Davis",
      specialty: "Cardio & Endurance",
      email: "emily@trainer.com",
      status: "Inactive",
    },
  ]);

  const toggleStatus = (id) => {
    const updated = trainers.map((trainer) =>
      trainer.id === id
        ? {
            ...trainer,
            status: trainer.status === "Active" ? "Inactive" : "Active",
          }
        : trainer
    );
    setTrainers(updated);
  };

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Manage Trainers</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-secondary rounded-md overflow-hidden text-left">
          <thead className="bg-accent text-light">
            <tr>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Specialty</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer) => (
              <tr key={trainer.id} className="border-t border-gray-700">
                <td className="py-3 px-6">{trainer.name}</td>
                <td className="py-3 px-6">{trainer.specialty}</td>
                <td className="py-3 px-6">{trainer.email}</td>
                <td className="py-3 px-6">
                  <span
                    className={`py-1 px-3 rounded-full text-sm ${
                      trainer.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    } text-light`}
                  >
                    {trainer.status}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => toggleStatus(trainer.id)}
                    className="bg-accent hover:bg-light hover:text-primary transition px-4 py-2 rounded-md"
                  >
                    Toggle Status
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

export default AdminTrainers;
