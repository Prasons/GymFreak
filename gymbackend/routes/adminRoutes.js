import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdmins,
  updateAdminStatus,
  deleteAdmin,
  refreshAdminToken
} from '../controllers/adminController.js';
import { adminProtect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', loginAdmin);
router.post('/refresh-token', refreshAdminToken);

// Apply admin protection to all routes below this line
router.use(adminProtect);

// Admin profile routes
router.route('/me')
  .get(getAdminProfile)                 // GET /api/admin/me
  .put(updateAdminProfile);            // PUT /api/admin/me

router.put('/me/change-password', changeAdminPassword);  // PUT /api/admin/me/change-password

// Admin management routes (super_admin only)
router.route('')
  .get(authorize('super_admin', 'admin'), getAdmins)     // GET /api/admin
  .post(authorize('super_admin'), registerAdmin);        // POST /api/admin

router.route('/:id/status')
  .put(authorize('super_admin'), updateAdminStatus);  // PUT /api/admin/:id/status

router.route('/:id')
  .delete(authorize('super_admin'), deleteAdmin);       // DELETE /api/admin/:id

export default router;
