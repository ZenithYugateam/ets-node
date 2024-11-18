import Timesheet from '../models/Timesheet.js';
import Activity from '../models/Activity.js';

export const getMyTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.find({ user: req.user._id })
      .sort('-weekStart');
    res.json(timesheets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.create({
      user: req.user._id,
      ...req.body
    });

    await Activity.create({
      user: req.user._id,
      type: 'timesheet',
      description: `Timesheet submitted for week of ${timesheet.weekStart}`
    });

    res.status(201).json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate('user', 'name email')
      .populate('approvedBy', 'name email');

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    if (timesheet.user._id.toString() !== req.user._id.toString() && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    if (timesheet.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (timesheet.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Cannot update timesheet that is not in draft status' 
      });
    }

    const updatedTimesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTimesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    await timesheet.remove();
    res.json({ message: 'Timesheet removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPendingTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.find({ status: 'submitted' })
      .populate('user', 'name email')
      .sort('-submittedAt');
    res.json(timesheets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const approveTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    timesheet.status = 'approved';
    timesheet.approvedBy = req.user._id;
    timesheet.approvedAt = Date.now();

    await timesheet.save();

    await Activity.create({
      user: req.user._id,
      type: 'timesheet',
      description: `Timesheet approved for ${timesheet.user}`
    });

    res.json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    timesheet.status = 'rejected';
    timesheet.comments.push({
      user: req.user._id,
      text: req.body.comment
    });

    await timesheet.save();

    await Activity.create({
      user: req.user._id,
      type: 'timesheet',
      description: `Timesheet rejected for ${timesheet.user}`
    });

    res.json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};