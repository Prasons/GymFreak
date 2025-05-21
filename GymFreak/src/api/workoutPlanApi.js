// Dummy data for workout plans
let workoutPlans = [
  {
    id: '1',
    name: 'Beginner Full Body',
    description: 'A full body workout for beginners',
    difficulty: 'Beginner',
    duration: 45,
    exercises: [
      { name: 'Push-ups', sets: 3, reps: '10-12' },
      { name: 'Bodyweight Squats', sets: 3, reps: '12-15' },
      { name: 'Dumbbell Rows', sets: 3, reps: '10-12' },
      { name: 'Plank', sets: 3, duration: '30 seconds' }
    ]
  },
  {
    id: '2',
    name: 'Advanced Strength',
    description: 'Advanced strength training program',
    difficulty: 'Advanced',
    duration: 60,
    exercises: [
      { name: 'Barbell Squats', sets: 4, reps: '6-8' },
      { name: 'Bench Press', sets: 4, reps: '6-8' },
      { name: 'Deadlifts', sets: 3, reps: '5' },
      { name: 'Pull-ups', sets: 3, reps: '8-10' }
    ]
  }
];

// User workout plan assignments { userId: [planId1, planId2, ...] }
const userWorkoutPlans = {};

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 500);
  });
};

export const getWorkoutPlans = async () => {
  return simulateApiCall([...workoutPlans]);
};

export const createWorkoutPlan = async (plan) => {
  const newPlan = {
    ...plan,
    id: Date.now().toString(),
    exercises: plan.exercises || []
  };
  workoutPlans.unshift(newPlan);
  return simulateApiCall(newPlan);
};

export const updateWorkoutPlan = async (id, updates) => {
  const index = workoutPlans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    workoutPlans[index] = { ...workoutPlans[index], ...updates };
    return simulateApiCall(workoutPlans[index]);
  }
  throw new Error('Workout plan not found');
};

export const deleteWorkoutPlan = async (id) => {
  const index = workoutPlans.findIndex(plan => plan.id === id);
  if (index !== -1) {
    const [deletedPlan] = workoutPlans.splice(index, 1);
    // Remove this plan from all users' assignments
    Object.keys(userWorkoutPlans).forEach(userId => {
      userWorkoutPlans[userId] = userWorkoutPlans[userId].filter(planId => planId !== id);
    });
    return simulateApiCall(deletedPlan);
  }
  throw new Error('Workout plan not found');
};

export const getUserWorkoutPlan = async (userId) => {
  const userPlans = (userWorkoutPlans[userId] || []).map(planId => 
    workoutPlans.find(p => p.id === planId)
  ).filter(Boolean);
  return simulateApiCall(userPlans);
};

export const setUserWorkoutPlan = async (userId, planIds) => {
  userWorkoutPlans[userId] = [...new Set(planIds)]; // Remove duplicates
  return simulateApiCall({ success: true });
};

export const removeUserWorkoutPlan = async (userId, planId) => {
  if (userWorkoutPlans[userId]) {
    userWorkoutPlans[userId] = userWorkoutPlans[userId].filter(id => id !== planId);
  }
  return simulateApiCall({ success: true });
};

export const unsetUserWorkoutPlan = async (userId) => {
  delete userWorkoutPlans[userId];
  return simulateApiCall({ success: true });
};
