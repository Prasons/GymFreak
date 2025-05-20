import React, { useEffect, useState } from "react";
import { getMyReferralCode, getMyReferrals } from "../api/referralApi";

const ReferralDashboard = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const codeRes = await getMyReferralCode();
        setReferralCode(codeRes.referral_code);
        const refs = await getMyReferrals();
        setReferrals(refs);
      } catch {
        // handle error
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Referral Program</h2>
      <div className="mb-8 bg-white rounded-lg shadow p-6 text-center">
        <div className="mb-3 font-semibold text-lg text-gray-700">Your Referral Code:</div>
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-xl font-mono px-4 py-2 bg-gray-100 rounded border border-accent">{referralCode}</span>
          <button
            onClick={handleCopy}
            className="bg-accent text-white px-3 py-1 rounded hover:bg-primary transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="text-sm text-gray-500">Share this code with friends. When they sign up, you get a gym merchandise reward!</div>
      </div>
      <h3 className="text-xl font-bold mb-4 text-primary">Your Referrals</h3>
      {loading ? (
        <div>Loading...</div>
      ) : referrals.length === 0 ? (
        <div className="text-gray-500 text-center">No referrals yet.</div>
      ) : (
        <table className="w-full text-sm bg-white rounded shadow">
          <thead>
            <tr className="bg-accent text-white">
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Reward</th>
              <th className="py-2 px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id} className="border-b last:border-b-0">
                <td className="py-2 px-3">{ref.referred_email_actual || ref.referred_email}</td>
                <td className="py-2 px-3 capitalize">{ref.status}</td>
                <td className="py-2 px-3">{ref.reward_given ? "Given" : "Pending"}</td>
                <td className="py-2 px-3">{new Date(ref.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReferralDashboard;
