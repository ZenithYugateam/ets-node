import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as activityController from '../controllers/activities.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'manager'), activityController.getActivities)
  .post(activityController.createActivity);

router.get('/user/:userId', authorize('admin', 'manager'), 
  activityController.getUserActivities);

export default router;