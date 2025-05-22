import MembershipPlan from "../models/membershipPlanModel.js";

// @desc    Create a new membership plan
// @route   POST /api/membership-plans
// @access  Private/Admin
export const createMembershipPlan = async (req, res) => {
  try {
    const { name, description, price, duration_days, features, is_popular } = req.body;

    if (!name || !price || !duration_days || !features || !Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, price, duration_days, and features array"
      });
    }

    const plan = await MembershipPlan.create({
      name,
      description,
      price: parseFloat(price),
      duration_days: parseInt(duration_days, 10),
      features,
      is_popular: Boolean(is_popular)
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error creating membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all membership plans
// @route   GET /api/membership-plans
// @access  Public
export const getMembershipPlans = async (req, res) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const plans = await MembershipPlan.findAll(activeOnly);
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error getting membership plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single membership plan
// @route   GET /api/membership-plans/:id
// @access  Public
export const getMembershipPlanById = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error getting membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update membership plan
// @route   PUT /api/membership-plans/:id
// @access  Private/Admin
export const updateMembershipPlan = async (req, res) => {
  try {
    const { name, description, price, duration_days, features, is_active, is_popular } = req.body;
    
    const plan = await MembershipPlan.update(req.params.id, {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      duration_days: duration_days ? parseInt(duration_days, 10) : undefined,
      features: features && Array.isArray(features) ? features : undefined,
      is_active,
      is_popular: is_popular !== undefined ? Boolean(is_popular) : undefined
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error updating membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete membership plan
// @route   DELETE /api/membership-plans/:id
// @access  Private/Admin
export const deleteMembershipPlan = async (req, res) => {
  try {
    const deleted = await MembershipPlan.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting membership plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle membership plan status
// @route   PATCH /api/membership-plans/:id/toggle-status
// @access  Private/Admin
export const toggleMembershipPlanStatus = async (req, res) => {
  try {
    const plan = await MembershipPlan.toggleStatus(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan,
      message: `Membership plan ${plan.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling membership plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
