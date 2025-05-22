import express from 'express';
import {
  createMembershipPlan,
  getMembershipPlans,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan,
  toggleMembershipPlanStatus
} from '../controllers/membershipPlanController.js';
import { adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getMembershipPlans);
router.get('/:id', getMembershipPlanById);

// Protected admin routes
router.post('/', adminProtect, createMembershipPlan);
router.put('/:id', adminProtect, updateMembershipPlan);
router.delete('/:id', adminProtect, deleteMembershipPlan);
router.patch('/:id/toggle-status', adminProtect, toggleMembershipPlanStatus);

export default router;
