// Dummy data for training schedules
let trainingSchedules = [
  {
    id: '1',
    title: 'Morning Yoga',
    description: 'Start your day with a refreshing yoga session',
    trainer: 'Sarah Johnson',
    day: 'Monday',
    startTime: '07:00',
    endTime: '08:00',
    maxParticipants: 15,
    currentParticipants: 8,
    level: 'All Levels',
    location: 'Yoga Studio A',
    enrolled: false
  },
  {
    id: '2',
    title: 'HIIT Workout',
    description: 'High Intensity Interval Training for maximum calorie burn',
    trainer: 'Mike Chen',
    day: 'Wednesday',
    startTime: '18:00',
    endTime: '19:00',
    maxParticipants: 20,
    currentParticipants: 15,
    level: 'Intermediate',
    location: 'Main Gym Floor',
    enrolled: true
  },
  {
    id: '3',
    title: 'Zumba Dance',
    description: 'Dance your way to fitness with energetic Latin rhythms',
    trainer: 'Maria Garcia',
    day: 'Friday',
    startTime: '17:30',
    endTime: '18:30',
    maxParticipants: 25,
    currentParticipants: 22,
    level: 'Beginner',
    location: 'Dance Studio',
    enrolled: false
  }
];

// User's enrolled schedules (in a real app, this would be per user)
let userEnrollments = [
  { userId: '1', scheduleId: '2', enrolledAt: new Date().toISOString() }
];

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 300);
  });
};

// Helper to get user ID (in a real app, this would come from auth)
const getCurrentUserId = () => '1'; // Mock user ID

export const getTrainingSchedules = async () => {
  try {
    // Return all training schedules with enrollment status for current user
    const userId = getCurrentUserId();
    const schedules = trainingSchedules.map(schedule => ({
      ...schedule,
      enrolled: userEnrollments.some(
        e => e.userId === userId && e.scheduleId === schedule.id
      )
    }));
    return simulateApiCall(schedules);
  } catch (error) {
    console.error("Error fetching training schedules:", error);
    throw error;
  }
};

export const createTrainingSchedule = async (schedule) => {
  try {
    const newSchedule = {
      ...schedule,
      id: (trainingSchedules.length + 1).toString(),
      currentParticipants: 0,
      enrolled: false
    };
    trainingSchedules.push(newSchedule);
    return simulateApiCall(newSchedule);
  } catch (error) {
    console.error("Error creating training schedule:", error);
    throw error;
  }
};

export const updateTrainingSchedule = async (id, schedule) => {
  try {
    const index = trainingSchedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    
    trainingSchedules[index] = { ...trainingSchedules[index], ...schedule };
    return simulateApiCall(trainingSchedules[index]);
  } catch (error) {
    console.error(`Error updating training schedule ${id}:`, error);
    throw error;
  }
};

export const deleteTrainingSchedule = async (id) => {
  try {
    const index = trainingSchedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    
    trainingSchedules = trainingSchedules.filter(s => s.id !== id);
    // Also remove any enrollments for this schedule
    userEnrollments = userEnrollments.filter(e => e.scheduleId !== id);
    
    return simulateApiCall({ success: true });
  } catch (error) {
    console.error(`Error deleting training schedule ${id}:`, error);
    throw error;
  }
};

export const getUserTrainingSchedules = async () => {
  try {
    const userId = getCurrentUserId();
    const enrolledScheduleIds = userEnrollments
      .filter(e => e.userId === userId)
      .map(e => e.scheduleId);
      
    const enrolledSchedules = trainingSchedules
      .filter(schedule => enrolledScheduleIds.includes(schedule.id))
      .map(schedule => ({
        ...schedule,
        enrolled: true,
        enrolledAt: userEnrollments.find(e => 
          e.userId === userId && e.scheduleId === schedule.id
        )?.enrolledAt
      }));
      
    return simulateApiCall(enrolledSchedules);
  } catch (error) {
    console.error("Error fetching user training schedules:", error);
    throw error;
  }
};

export const enrollUserTrainingSchedules = async (scheduleIds) => {
  try {
    const userId = getCurrentUserId();
    const currentTime = new Date().toISOString();
    
    scheduleIds.forEach(scheduleId => {
      if (!userEnrollments.some(e => e.userId === userId && e.scheduleId === scheduleId)) {
        userEnrollments.push({
          userId,
          scheduleId,
          enrolledAt: currentTime
        });
        
        // Update current participants count
        const schedule = trainingSchedules.find(s => s.id === scheduleId);
        if (schedule && schedule.currentParticipants < schedule.maxParticipants) {
          schedule.currentParticipants += 1;
        }
      }
    });
    
    return simulateApiCall({ success: true });
  } catch (error) {
    console.error("Error enrolling in training schedules:", error);
    throw error;
  }
};

export const unenrollUserTrainingSchedule = async (scheduleId) => {
  try {
    const userId = getCurrentUserId();
    const enrollmentIndex = userEnrollments.findIndex(
      e => e.userId === userId && e.scheduleId === scheduleId
    );
    
    if (enrollmentIndex !== -1) {
      userEnrollments.splice(enrollmentIndex, 1);
      
      // Update current participants count
      const schedule = trainingSchedules.find(s => s.id === scheduleId);
      if (schedule && schedule.currentParticipants > 0) {
        schedule.currentParticipants -= 1;
      }
    }
    
    return simulateApiCall({ success: true });
  } catch (error) {
    console.error(`Error unenrolling from training schedule ${scheduleId}:`, error);
    throw error;
  }
};

export const unenrollAllUserTrainingSchedules = async () => {
  try {
    const userId = getCurrentUserId();
    
    // Get all schedule IDs the user is enrolled in
    const userScheduleIds = userEnrollments
      .filter(e => e.userId === userId)
      .map(e => e.scheduleId);
    
    // Update participant counts
    userScheduleIds.forEach(scheduleId => {
      const schedule = trainingSchedules.find(s => s.id === scheduleId);
      if (schedule && schedule.currentParticipants > 0) {
        schedule.currentParticipants -= 1;
      }
    });
    
    // Remove all user's enrollments
    userEnrollments = userEnrollments.filter(e => e.userId !== userId);
    
    return simulateApiCall({ success: true });
  } catch (error) {
    console.error("Error unenrolling from all training schedules:", error);
    throw error;
  }
};
