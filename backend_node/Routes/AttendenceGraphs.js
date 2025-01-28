const express = require("express");
const router = express.Router();
const TimeLog = require("../Models/TimeLog");
const getWeeklyData = async () => {
  const now = new Date();
  const labels = [];
  const dataMap = {};

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const label = date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    labels.push(label);
    dataMap[label] = { present: 0, absent: 0 };
  }

  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const rawData = await TimeLog.aggregate([
    { $match: { checkIn: { $gte: startOfWeek } } },
    {
      $group: {
        _id: { $dayOfWeek: "$checkIn" },
        present: { $sum: { $cond: [{ $ifNull: ["$checkOut", false] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $ifNull: ["$checkOut", false] }, 0, 1] } },
      },
    },
  ]);

  rawData.forEach((item) => {
    const date = new Date();
    date.setDate(now.getDate() - (7 - item._id));
    const label = date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    if (dataMap[label]) {
      dataMap[label].present = item.present;
      dataMap[label].absent = item.absent;
    }
  });

  const data = labels.map((label) => dataMap[label]);
  return { labels, data };
};


const getMonthlyData = async () => {
  const now = new Date();
  const labels = [];
  const dataMap = {}; // Map _id to data for easier alignment

  // Generate the last 12 months as labels
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    labels.push(label);
    dataMap[label] = { present: 0, absent: 0 }; // Initialize to 0
  }

  const startOfYear = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const rawData = await TimeLog.aggregate([
    { $match: { checkIn: { $gte: startOfYear } } },
    {
      $group: {
        _id: {
          year: { $year: "$checkIn" },
          month: { $month: "$checkIn" },
        },
        present: { $sum: { $cond: [{ $ifNull: ["$checkOut", false] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $ifNull: ["$checkOut", false] }, 0, 1] } },
      },
    },
  ]);

  // Map rawData to the corresponding labels
  rawData.forEach((item) => {
    const label = new Date(item._id.year, item._id.month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (dataMap[label]) {
      dataMap[label].present = item.present;
      dataMap[label].absent = item.absent;
    }
  });

  const data = labels.map((label) => dataMap[label]); // Align data with labels
  return { labels, data };
};


const getYearlyData = async () => {
  const labels = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const dataMap = {};

  for (let i = 11; i >= 0; i--) {
    const year = currentYear - i;
    labels.push(year.toString());
    dataMap[year] = { present: 0, absent: 0 }; 
  }

  const startOfYear = new Date(currentYear - 11, 0, 1);
  const rawData = await TimeLog.aggregate([
    { $match: { checkIn: { $gte: startOfYear } } },
    {
      $group: {
        _id: { $year: "$checkIn" }, 
        present: { $sum: { $cond: [{ $ifNull: ["$checkOut", false] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $ifNull: ["$checkOut", false] }, 0, 1] } },
      },
    },
  ]);

  rawData.forEach((item) => {
    if (dataMap[item._id]) {
      dataMap[item._id].present = item.present;
      dataMap[item._id].absent = item.absent;
    }
  });

  const data = labels.map((label) => dataMap[parseInt(label)]);
  return { labels, data };
};


router.get("/", async (req, res) => {
  const { period } = req.query;
  try {
    let data;
    if (period === "weekly") data = await getWeeklyData();
    else if (period === "monthly") data = await getMonthlyData();
    else if (period === "yearly") data = await getYearlyData();
    else throw new Error("Invalid period");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;