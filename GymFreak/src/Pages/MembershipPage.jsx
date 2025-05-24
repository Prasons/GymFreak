import React, { useEffect, useState } from "react";
import { FaDumbbell, FaCheck, FaCrown, FaBolt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMembershipPlans } from "../services/membershipPlanService";







const MembershipPage = () => {
  const fetchPlans = async () => {
    try {
      const response = await getMembershipPlans();
      // Access the data property from the response
      const responseData = response.data || {};
      // Check if the data is an array or has a data property that's an array
      const plans = Array.isArray(responseData) 
        ? responseData 
        : (Array.isArray(responseData.data) ? responseData.data : []);
      
      console.log('Fetched diet plans:', plans);
      setMembershipPlans(plans);
    } catch (err) {
      console.error('Error fetching diet plans:', err);
      setMembershipPlans([]);
    } finally {
    }
  };
  useEffect(() => {
    fetchPlans();
  }, []);
  const [selectedPlan, setSelectedPlan] = useState(null);
const [membershipPlans, setMembershipPlans] = useState([]); 
  const handleSubscribe = (planId) => {
    setSelectedPlan(planId);
    const plan = membershipPlans.find(p => p.id === planId);
    toast.success(`Successfully subscribed to ${plan.name}`);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Membership Plan</h1>
          <p className="text-gray-400 text-lg">Unlock your potential with our flexible membership options</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {membershipPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-zinc-900 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300 ${plan.is_popular ? 'border-2 border-' + plan.color + '-500' : ''}`}
            >
              {plan.is_popular && (
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-${plan.color}-500 text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-gray-400 ml-2">/{Math.floor(plan.duration_days/30)} month</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <FaCheck className={`text-${plan.color}-500`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-3 px-6 rounded-xl bg-${plan.color}-500 hover:bg-${plan.color}-600 text-white font-semibold transition-colors duration-200`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            All plans include access to our mobile app and 24/7 customer support.
            <br />
            Need help choosing? Contact our team for guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
