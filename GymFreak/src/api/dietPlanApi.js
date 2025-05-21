// Dummy data for diet plans
let dietPlans = [
  {
    id: '1',
    name: 'Weight Loss Plan',
    description: 'A balanced 7-day meal plan designed for sustainable weight loss with portion control and nutrient-dense foods.',
    category: 'Weight Loss',
    duration: '4 weeks',
    calories: 1500,
    meals: [
      { time: 'Breakfast', meal: 'Oatmeal with berries, chia seeds, and almond butter', calories: 350 },
      { time: 'Snack', meal: 'Greek yogurt with mixed nuts', calories: 200 },
      { time: 'Lunch', meal: 'Grilled chicken salad with mixed greens, cherry tomatoes, cucumber, and balsamic vinaigrette', calories: 450 },
      { time: 'Snack', meal: 'Sliced apple with peanut butter', calories: 200 },
      { time: 'Dinner', meal: 'Baked salmon with quinoa and steamed broccoli', calories: 500 }
    ],
    benefits: ['Promotes fat loss', 'Balanced macronutrients', 'High in fiber', 'Rich in omega-3']
  },
  {
    id: '2',
    name: 'Muscle Gain Plan',
    description: 'High-protein meal plan designed to support muscle growth and recovery with optimal macronutrient ratios.',
    category: 'Muscle Gain',
    duration: '8 weeks',
    calories: 3000,
    meals: [
      { time: 'Breakfast', meal: '6 egg whites, 2 whole eggs, 1 cup oatmeal, 1 banana', calories: 650 },
      { time: 'Snack', meal: 'Protein shake with 2 scoops whey, 1 cup almond milk, 1 tbsp peanut butter', calories: 400 },
      { time: 'Lunch', meal: '8oz grilled chicken breast, 2 cups brown rice, 1 cup mixed vegetables', calories: 800 },
      { time: 'Pre-Workout', meal: '1 cup Greek yogurt with 1/2 cup granola', calories: 300 },
      { time: 'Post-Workout', meal: 'Protein shake with banana and almond milk', calories: 350 },
      { time: 'Dinner', meal: '8oz sirloin steak, 1 large sweet potato, 2 cups steamed vegetables', calories: 800 }
    ],
    benefits: ['Supports muscle growth', 'High in protein', 'Sustained energy', 'Optimal recovery']
  },
  {
    id: '3',
    name: 'Vegan Muscle Builder',
    description: 'Plant-based high-protein meal plan for muscle building without animal products.',
    category: 'Vegan',
    duration: '6 weeks',
    calories: 2800,
    meals: [
      { time: 'Breakfast', meal: 'Tofu scramble with spinach, mushrooms, and whole grain toast', calories: 500 },
      { time: 'Snack', meal: 'Protein smoothie with pea protein, banana, and almond butter', calories: 400 },
      { time: 'Lunch', meal: 'Lentil curry with brown rice and roasted vegetables', calories: 700 },
      { time: 'Snack', meal: 'Chickpea salad with tahini dressing', calories: 300 },
      { time: 'Dinner', meal: 'Tempeh stir-fry with quinoa and mixed vegetables', calories: 600 },
      { time: 'Before Bed', meal: 'Casein protein pudding with chia seeds', calories: 300 }
    ],
    benefits: ['100% plant-based', 'High in fiber', 'Rich in antioxidants', 'Supports muscle recovery']
  },
  {
    id: '4',
    name: 'Keto Fat Burner',
    description: 'Low-carb, high-fat meal plan designed to put your body in ketosis for optimal fat burning.',
    category: 'Keto',
    duration: '30 days',
    calories: 1800,
    meals: [
      { time: 'Breakfast', meal: 'Avocado and eggs with bacon', calories: 500 },
      { time: 'Snack', meal: 'Handful of macadamia nuts and cheese cubes', calories: 300 },
      { time: 'Lunch', meal: 'Bunless burger with cheddar and avocado, side of roasted Brussels sprouts', calories: 600 },
      { time: 'Snack', meal: 'Celery sticks with almond butter', calories: 200 },
      { time: 'Dinner', meal: 'Grilled salmon with asparagus and hollandaise sauce', calories: 600 }
    ],
    benefits: ['Promotes fat burning', 'Reduces cravings', 'Stable energy levels', 'Supports mental clarity']
  },
  {
    id: '5',
    name: 'Athlete\'s Performance',
    description: 'High-performance meal plan designed for athletes with optimal carb cycling.',
    category: 'Performance',
    duration: 'Ongoing',
    calories: 3500,
    meals: [
      { time: 'Pre-Workout', meal: 'Oatmeal with banana and honey', calories: 400 },
      { time: 'Post-Workout', meal: 'Protein shake with banana and berries', calories: 500 },
      { time: 'Meal 1', meal: '6 egg whites, 3 whole eggs, 1 cup sweet potato hash', calories: 700 },
      { time: 'Meal 2', meal: '8oz grilled chicken, 1.5 cups jasmine rice, 1 cup vegetables', calories: 800 },
      { time: 'Meal 3', meal: '8oz lean beef, 2 cups roasted vegetables, 1/2 cup quinoa', calories: 750 },
      { time: 'Before Bed', meal: 'Casein protein with almond butter', calories: 350 }
    ],
    benefits: ['Optimized for performance', 'Supports recovery', 'Sustained energy', 'Muscle preservation']
  }
];

let userSelectedPlans = [];

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 500);
  });
};

export const getDietPlans = async () => {
  return simulateApiCall([...dietPlans]);
};

export const createDietPlan = async (plan) => {
  const newPlan = {
    ...plan,
    id: Date.now().toString(),
    meals: Array.isArray(plan.meals) ? plan.meals : [plan.meals || '']
  };
  dietPlans.unshift(newPlan);
  return simulateApiCall(newPlan);
};

export const updateDietPlan = async (id, updates) => {
  const index = dietPlans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    dietPlans[index] = { ...dietPlans[index], ...updates };
    return simulateApiCall(dietPlans[index]);
  }
  throw new Error('Diet plan not found');
};

export const deleteDietPlan = async (id) => {
  const index = dietPlans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    const [deletedPlan] = dietPlans.splice(index, 1);
    return simulateApiCall(deletedPlan);
  }
  throw new Error('Diet plan not found');
};

export const getUserDietPlan = async () => {
  return simulateApiCall([...userSelectedPlans]);
};

export const setUserDietPlan = async (dietplan_ids) => {
  userSelectedPlans = dietPlans.filter(plan => dietplan_ids.includes(plan.id));
  return simulateApiCall({ success: true });
};

export const removeUserDietPlan = async (dietplan_id) => {
  userSelectedPlans = userSelectedPlans.filter(plan => plan.id !== dietplan_id);
  return simulateApiCall({ success: true });
};

export const deleteUserDietPlans = async () => {
  userSelectedPlans = [];
  return simulateApiCall({ success: true });
};
