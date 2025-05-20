import React, { useEffect, useState } from "react";
import { getAllReferrals, markRewardGiven } from "../api/referralApi";

const AdminReferralDashboard = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const data = await getAllReferrals();
      setReferrals(data);
    } catch {
      // handle error
    }
    setLoading(false);
  };

  const handleMarkGiven = async (id) => {
    await markRewardGiven(id);
    setSuccess("Reward marked as given.");
    fetchReferrals();
    setTimeout(() => setSuccess(""), 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Admin: Referrals</h2>
      {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : referrals.length === 0 ? (
        <div className="text-gray-500 text-center">No referrals yet.</div>
      ) : (
        <table className="w-full text-sm bg-white rounded shadow">
          <thead>
            <tr className="bg-accent text-white">
              <th className="py-2 px-3">Referrer</th>
              <th className="py-2 px-3">Referred</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Reward</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id} className="border-b last:border-b-0">
                <td className="py-2 px-3">{ref.referrer_email}</td>
                <td className="py-2 px-3">{ref.referred_email_actual || ref.referred_email}</td>
                <td className="py-2 px-3 capitalize">{ref.status}</td>
                <td className="py-2 px-3">{ref.reward_given ? "Given" : "Pending"}</td>
                <td className="py-2 px-3">{new Date(ref.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-3">
                  {!ref.reward_given && ref.status === "success" && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-800 text-xs"
                      onClick={() => handleMarkGiven(ref.id)}
                    >
                      Mark as Given
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReferralDashboard;
