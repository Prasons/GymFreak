// Dummy users data
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    membership: 'premium',
    joinDate: '2023-01-15',
    lastLogin: new Date().toISOString(),
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    membership: 'admin',
    joinDate: '2022-11-05',
    lastLogin: new Date().toISOString(),
    status: 'active',
    profileImage: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'user',
    membership: 'basic',
    joinDate: '2023-03-20',
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'inactive',
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg'
  }
];

// Current logged in user ID (simulated)
let currentUserId = '1';

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 500);
  });
};

// User authentication
export const loginUser = async (email, password) => {
  // In a real app, this would validate credentials
  const user = users.find(u => u.email === email && u.status === 'active');
  if (!user) {
    throw new Error('Invalid credentials or account not active');
  }
  currentUserId = user.id;
  return simulateApiCall({
    user: { ...user, password: undefined },
    token: `dummy-jwt-token-${user.id}`
  });
};

export const registerUser = async (userData) => {
  const newUser = {
    ...userData,
    id: (users.length + 1).toString(),
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    profileImage: 'https://randomuser.me/api/portraits/lego/1.jpg'
  };
  users.push(newUser);
  currentUserId = newUser.id;
  return simulateApiCall({
    user: { ...newUser, password: undefined },
    token: `dummy-jwt-token-${newUser.id}`
  });
};

// User profile
export const getProfile = async () => {
  const user = users.find(u => u.id === currentUserId);
  if (!user) throw new Error('User not found');
  return simulateApiCall({ ...user, password: undefined });
};

export const updateProfile = async (userData) => {
  const index = users.findIndex(u => u.id === currentUserId);
  if (index === -1) throw new Error('User not found');
  
  users[index] = { ...users[index], ...userData };
  return simulateApiCall({ ...users[index], password: undefined });
};

// Admin user management
export const getAllUsers = async () => {
  return simulateApiCall(users.map(u => ({
    ...u,
    password: undefined
  })));
};

export const getUserById = async (id) => {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  return simulateApiCall({ ...user, password: undefined });
};

export const updateUser = async (id, userData) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');
  
  users[index] = { ...users[index], ...userData };
  return simulateApiCall({ ...users[index], password: undefined });
};

export const changeUserStatus = async (id, status) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');
  
  users[index].status = status;
  return simulateApiCall({ 
    ...users[index], 
    password: undefined,
    message: `User status updated to ${status}`
  });
};

export const deleteUser = async (id) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');
  
  const [deletedUser] = users.splice(index, 1);
  return simulateApiCall({ 
    success: true, 
    message: 'User deleted successfully',
    userId: id
  });
};

// Helper to get current user (for testing)
export const getCurrentUser = () => {
  return users.find(u => u.id === currentUserId);
};
