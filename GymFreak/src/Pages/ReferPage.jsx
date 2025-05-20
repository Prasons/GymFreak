import React, { useState } from "react";

const ReferPage = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referredFriends, setReferredFriends] = useState([
    { id: 1, name: "John Doe", status: "Joined" },
    { id: 2, name: "Jane Smith", status: "Pending" },
  ]);

  const generateReferralCode = () => {
    // Generate a random referral code
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setReferralCode(code);
  };

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Refer a Friend</h1>

      <div className="max-w-3xl mx-auto bg-secondary p-6 rounded-md">
        {/* Referral Code Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Referral Code</h2>
          {referralCode ? (
            <div className="bg-accent text-light py-3 px-6 rounded-md inline-block font-bold text-lg">
              {referralCode}
            </div>
          ) : (
            <button
              onClick={generateReferralCode}
              className="bg-accent text-light py-3 px-6 rounded-md font-bold text-lg hover:bg-light hover:text-primary transition"
            >
              Generate Referral Code
            </button>
          )}
        </div>

        {/* Referred Friends Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Referred Friends</h2>
          {referredFriends.length > 0 ? (
            <div className="bg-light text-primary p-4 rounded-md">
              <ul>
                {referredFriends.map((friend) => (
                  <li
                    key={friend.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span className="font-medium">{friend.name}</span>
                    <span
                      className={`py-1 px-3 rounded-md ${
                        friend.status === "Joined"
                          ? "bg-green-500 text-light"
                          : "bg-yellow-500 text-light"
                      }`}
                    >
                      {friend.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-lg">No friends referred yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferPage;
