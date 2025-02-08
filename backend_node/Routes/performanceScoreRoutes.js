const express = require("express");
const router = express.Router();
const PerformanceScore = require("../Models/PerformanceScore");

router.put("/", async (req, res) => {
  try {
    const { taskId, score, userid, userName, difficulty } = req.body;

    if (!taskId || score === undefined || !userid || !userName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let performanceScore = await PerformanceScore.findOne({ userId: userid });

    if (performanceScore) {
      if (!performanceScore.taskIds.includes(taskId)) {
        performanceScore.taskIds.push(taskId); 
      }

      performanceScore.TotalScore += score;
      performanceScore.MonthlyScore += score;
      performanceScore.userName = userName; 

      if (difficulty) {
        performanceScore.difficulty = difficulty;
      }
      
      performanceScore.updatedAt = Date.now();

      await performanceScore.save();

      return res.status(200).json({
        message: "Performance score updated successfully",
        performanceScore,
      });
    } else {
      performanceScore = new PerformanceScore({
        taskIds: [taskId], 
        TotalScore: score,
        MonthlyScore: score,
        userId: userid,
        userName,
        difficulty: difficulty || "Easy",
      });
      await performanceScore.save();

      return res.status(200).json({
        message: "Performance score created successfully",
        performanceScore,
      });
    }
  } catch (error) {
    console.error("Error updating performance score:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
