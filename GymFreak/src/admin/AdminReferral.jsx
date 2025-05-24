import React, { useEffect, useState } from "react";
import { getAllReferrals, markRewardGiven } from "../api/referralApi";

const AdminReferral = () => {

  const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

   useEffect(() => {
      fetchReferrals();
    }, []);
  
    const fetchReferrals = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllReferrals();
        setReferrals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setError("Failed to load referrals. Please try again later.");
        toast.error("Failed to load referrals");
      } finally {
        setLoading(false);
      }
    };
      if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-500/10 text-red-500 rounded-lg">{error}</div>
  );

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
                <td className="p-2">{ref.referrer_email}</td>
                <td className="p-2">{ref.referral_code}</td>
                <td className="p-2">{ref.total_referred}</td>
                <td className="p-2">${ref.total_referred*5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReferral;
