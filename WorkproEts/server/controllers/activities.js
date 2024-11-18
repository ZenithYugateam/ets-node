import Activity from '../models/Activity.js';

export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email')
      .sort('-timestamp');
    res.json(activities);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.params.userId })
      .populate('user', 'name email')
      .sort('-timestamp');
    res.json(activities);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};