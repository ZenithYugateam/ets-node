const express = require('express');
const router = express.Router();
const TimeLog = require('../Models/TimeLog'); 

router.get('/api/attendance/:date', async (req, res) => {
  const { date } = req.params;
  try {
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const targetDate = new Date(date);

    const timeLogs = await TimeLog.find({
      $expr: {
        $eq: [
          { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
          targetDate.toISOString().split('T')[0],
        ],
      },
    });

    const employees = timeLogs.filter((log) => log.role === 'Employee');
    const managers = timeLogs.filter((log) => log.role === 'Manager');

    res.status(200).json({ managers, employees });
  } catch (error) {
    console.error('Error fetching attendance data:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
