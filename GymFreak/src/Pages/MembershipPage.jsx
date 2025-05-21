import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-3 w-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

const MembershipPage = () => {
  const membershipPlans = [
    {
      id: 1,
      name: "Basic",
      price: 20,
      features: [
        "Access to gym facilities",
        "1 personal training session",
        "Basic equipment access",
        "Locker room access",
        "Fitness assessment",
      ],
    },
    {
      id: 2,
      name: "Standard",
      price: 40,
      features: [
        "All Basic features",
        "4 personal training sessions",
        "Group classes access",
        "Nutrition consultation",
        "Fitness tracking app",
      ],
    },
    {
      id: 3,
      name: "Premium",
      price: 60,
      features: [
        "All Standard features",
        "Unlimited training sessions",
        "Priority booking",
        "Free merchandise",
        "24/7 gym access",
      ],
    },
  ];

  const handleSubscribe = (planName) => {
    alert(`You have selected the ${planName} plan!`);
    // Redirect to payment page or handle subscription logic here
  };

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-light mb-12">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipPlans.map((plan) => (
            <Card key={plan.id} className="w-full p-8 bg-secondary hover:bg-neutral/10 transition-colors duration-300">
              <CardHeader
                floated={false}
                shadow={false}
                color="transparent"
                className="m-0 mb-8 rounded-none border-b border-white/10 pb-8 text-center"
              >
                <Typography
                  variant="small"
                  color="white"
                  className="font-medium uppercase text-neutral"
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="h1"
                  color="white"
                  className="mt-6 flex justify-center gap-1 text-7xl font-normal text-light"
                >
                  <span className="mt-2 text-4xl">$</span>{plan.price}{" "}
                  <span className="self-end text-4xl">/mo</span>
                </Typography>
              </CardHeader>
              <CardBody className="p-0">
                <ul className="flex flex-col gap-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <span className="rounded-full border border-neutral bg-neutral/10 p-1 text-neutral">
                        <CheckIcon />
                      </span>
                      <Typography className="font-normal">{feature}</Typography>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="mt-12 p-0">
                <Button
                  size="lg"
                  color="white"
                  className="bg-neutral hover:bg-accent text-primary hover:text-light transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] active:scale-100"
                  ripple={false}
                  fullWidth={true}
                  onClick={() => handleSubscribe(plan.name)}
                >
                  Choose {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
