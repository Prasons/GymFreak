import React from "react";

const MembershipPage = () => {
  const membershipPlans = [
    {
      id: 1,
      name: "Basic",
      price: "$20/month",
      features: [
        "Access to gym facilities",
        "1 personal training session per month",
      ],
    },
    {
      id: 2,
      name: "Standard",
      price: "$40/month",
      features: [
        "Access to gym facilities",
        "4 personal training sessions per month",
        "Access to group classes",
      ],
    },
    {
      id: 3,
      name: "Premium",
      price: "$60/month",
      features: [
        "Access to gym facilities",
        "Unlimited personal training sessions",
        "Access to group classes",
        "Free merchandise",
      ],
    },
  ];

  const handleSubscribe = (planName) => {
    alert(`You have selected the ${planName} plan!`);
    // Redirect to payment page or handle subscription logic here
  };

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Membership Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-secondary p-6 rounded-lg shadow-lg flex flex-col items-center"
          >
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-xl font-semibold mb-4">{plan.price}</p>
            <ul className="mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-sm mb-2">
                  - {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.name)}
              className="bg-accent text-light py-2 px-6 rounded-md hover:bg-light hover:text-primary transition"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipPage;
