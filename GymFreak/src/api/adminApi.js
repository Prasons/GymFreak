// Dummy data for admins
let admins = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'super_admin',
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
    status: 'active',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2023-02-15T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Support User',
    email: 'support@example.com',
    role: 'support',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2023-03-10T00:00:00.000Z'
  }
];

// Current logged in admin ID (simulated)
let currentAdminId = '1';

// Simulate API delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), 500);
  });
};

// Admin authentication
export const adminLogin = async (email, password) => {
  // In a real app, this would validate credentials
  const admin = admins.find(a => a.email === email && a.status === 'active');
  if (!admin) {
    throw new Error('Invalid admin credentials or account not active');
  }
  currentAdminId = admin.id;
  return simulateApiCall({
    admin: { ...admin, password: undefined },
    token: `dummy-admin-token-${admin.id}`
  });
};

// Admin profile
export const getAdminProfile = async () => {
  const admin = admins.find(a => a.id === currentAdminId);
  if (!admin) throw new Error('Admin not found');
  return simulateApiCall({ ...admin, password: undefined });
};

export const updateAdminProfile = async (profileData) => {
  const index = admins.findIndex(a => a.id === currentAdminId);
  if (index === -1) throw new Error('Admin not found');
  
  admins[index] = { ...admins[index], ...profileData };
  return simulateApiCall({ ...admins[index], password: undefined });
};

export const changeAdminPassword = async (currentPassword, newPassword) => {
  const index = admins.findIndex(a => a.id === currentAdminId);
  if (index === -1) throw new Error('Admin not found');
  
  // In a real app, we would verify currentPassword first
  return simulateApiCall({
    success: true,
    message: 'Password updated successfully'
  });
};

// Admin management
export const getAdmins = async () => {
  return simulateApiCall(admins.map(admin => ({
    ...admin,
    password: undefined
  })));
};

export const registerAdmin = async (adminData) => {
  const newAdmin = {
    ...adminData,
    id: (admins.length + 1).toString(),
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    role: adminData.role || 'support' // Default to lowest privilege
  };
  admins.push(newAdmin);
  return simulateApiCall({
    ...newAdmin,
    password: undefined,
    message: 'Admin registered successfully'
  });
};

export const updateAdminStatus = async (id, status) => {
  const index = admins.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Admin not found');
  
  // Prevent deactivating self
  if (id === currentAdminId) {
    throw new Error('Cannot deactivate your own account');
  }
  
  admins[index].status = status;
  return simulateApiCall({
    ...admins[index],
    password: undefined,
    message: `Admin status updated to ${status}`
  });
};

export const deleteAdmin = async (id) => {
  const index = admins.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Admin not found');
  
  // Prevent deleting self
  if (id === currentAdminId) {
    throw new Error('Cannot delete your own account');
  }
  
  const [deletedAdmin] = admins.splice(index, 1);
  return simulateApiCall({
    success: true,
    message: 'Admin deleted successfully',
    adminId: id
  });
};
