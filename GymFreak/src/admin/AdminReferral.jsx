import React from "react";

const AdminReferral = () => {
  const referrals = [
    {
      id: 1,
      user: "John Doe",
      code: "A1B2C3D4",
      referredCount: 3,
      reward: "$15",
    },
    {
      id: 2,
      user: "Jane Smith",
      code: "Z9Y8X7W6",
      referredCount: 1,
      reward: "$5",
    },
  ];

  return (
    <div className="p-8 bg-primary min-h-screen text-light">
      <h1 className="text-4xl font-bold text-center mb-6">
        Admin - Referral Management
      </h1>
      <div className="bg-secondary p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Referral Summary</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Referral Code</th>
              <th className="p-2">Referred Users</th>
              <th className="p-2">Reward</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id} className="border-t">
                <td className="p-2">{ref.user}</td>
                <td className="p-2">{ref.code}</td>
                <td className="p-2">{ref.referredCount}</td>
                <td className="p-2">{ref.reward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReferral;
