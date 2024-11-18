import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as timesheetController from '../controllers/timesheets.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(timesheetController.getMyTimesheets)
  .post(timesheetController.createTimesheet);

router.get('/pending', authorize('admin', 'manager'), 
  timesheetController.getPendingTimesheets);

router.route('/:id')
  .get(timesheetController.getTimesheet)
  .put(timesheetController.updateTimesheet)
  .delete(authorize('admin'), timesheetController.deleteTimesheet);

router.put('/:id/approve', authorize('admin', 'manager'), 
  timesheetController.approveTimesheet);

router.put('/:id/reject', authorize('admin', 'manager'), 
  timesheetController.rejectTimesheet);

export default router;