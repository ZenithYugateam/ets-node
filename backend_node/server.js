const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://codeprabhas121:iZDnnBM35UmVGGNZ@etscluster.7ckqo.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to the ETS database successfully");
  })
  .catch((error) => {
    console.error("Error connecting to the ETS database:", error);
  });

// Schemas
const timesheetSchema = new mongoose.Schema({
  date: Date,
  entries: [
    {
      project: String,
      hours: Number,
      description: String,
      task: String,
    },
  ],
});

const subDepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employees: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
    },
  ],
});
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subDepartments: [subDepartmentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the Department model
const Department = mongoose.model("Department", departmentSchema);

const userSchema = new mongoose.Schema({
  adminId: { type: String },
  name: String,
  password: String,
  email: String,
  role: String,
  department: String,
  manager: { type: String, default: "" },
  status: String,
  delete: Boolean,
  subDepartment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignee: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // Updated type
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // Added field
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  progress: { type: Number, default: 0 },
  department: { type: String },
  description: { type: String },
});

//get api for name Userschema
app.post("/api/usersData_total", async (req, res) => {
  try {
    let userId = req.body;

    console.log("user id  .......", userId);

    const user = await User.findById(mongoose.Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the name of the user
    res.json({ name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const Task = mongoose.model("Task", taskSchema);

const leaveRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["vacation", "sick", "personal"],
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"], // Optional: restrict to specific values
    default: "pending",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId("647f1f77bcf86cd799439011"), // Default assignee ID
    required: true,
  },
  userid: {
    type: String,
    required: true,
    required: [true, "Path `userid` is required"],
    default: "",
  },
  username: { type: String, default: "" },
  assigneeRole: {
    type: String,
    enum: ["admin", "manager"], // Define roles for the assignee
    default: "admin",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` before saving
leaveRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

// Leave Request Routes

// POST API for creating leave requests
// In your Express route handler
app.post("/api/leave-requests", async (req, res) => {
  try {
    const { type, startDate, endDate, reason, userid, username } = req.body;
    console.log("stage one sucesss.............." + req.body);

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).send("End date cannot be earlier than start date");
    }
    console.log("stage 2nd sucesss.............." + req.body);

    const newLeaveRequest = new LeaveRequest({
      type,
      startDate,
      endDate,
      reason,
      userid,
      status: "pending",
      username: username,
    });
    console.log("stage 3nd sucesss.............." + newLeaveRequest);
    await newLeaveRequest.save();
    console.log("stage one sucesss.............." + newLeaveRequest);
    res.status(201).send(newLeaveRequest);
    console.log("stage second sucesss.............." + newLeaveRequest);
  } catch (error) {
    res.status(500).send(`Error creating leave request: ${error.message}`);
  }
});

app.get("/api/leave-requests", async (req, res) => {
  try {
    const { userid, assigneeId } = req.query;
    const filter = {};

    if (userid) filter.userid = userid;
    if (assigneeId) filter.assigneeId = assigneeId;

    const leaveRequests = await LeaveRequest.find(filter);
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/leave-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(
      ".......................................................",
      id + " ",
      status
    );

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    console.log("ioiioi");

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    console.log("leave requesr ", leaveRequest);

    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// DELETE API for deleting a leave request by ID
app.delete("/api/leave-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Log the received ID for debugging
    console.log("Deleting leave request with ID:", id);

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Find and delete the leave request by ID
    const leaveRequest = await LeaveRequest.findByIdAndDelete(id);

    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    // Respond with success message and deleted document
    res.status(200).json({
      message: "Leave request deleted successfully",
      deletedLeaveRequest: leaveRequest,
    });
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ error: error.message });
  }
});

const bodyParser = require("body-parser");

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    bodyParser.json()(req, res, next);
  } else {
    next();
  }
});

// Models
const Timesheet = mongoose.model("timesheet", timesheetSchema);
const User = mongoose.model("users", userSchema);

app.get("/api/user/:id", async (req, res) => {
  const { id } = req.params;

  console.log("tyuiouytyuiuytyuioiuyu.......////////" + id);

  // Validate the MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  console.log("tyuiouytyuiuytyuioiuyu.......////////" + id);

  try {
    const user = await User.findById(id);

    console.log("sdhfsfh" + user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });

      console.log("ffffffffffffffff////////" + id);
    }

    return res.status(200).json(user);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

app.post("/api/getProfileData", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(user);
  } catch (error) {
    console.log("Error fetching user profile:", error);
    return res.status(500).send("Error fetching user profile");
  }
});

// Timesheet Routes
app.post("/api/save_entries", async (req, res) => {
  const { date, entries } = req.body;
  try {
    const newTimesheet = new Timesheet({ date, entries });
    await newTimesheet.save();
    return res.status(200).send(newTimesheet);
  } catch (error) {
    console.log("Error saving the entry:", error);
    return res.status(500).send("Error saving the entries");
  }
});

// User Routes
// app.post("/api/users/add", async (req, res) => {
//   console.log("response from the server : " + req.body);
//   try {
//     const user = new User(req.body);
//     let result = await user.save();
//     console.log("give me update");
//     return res.status(200).send(result);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// Add this to your existing routes// Update your existing department route
// Adjust path as needed

// Route to get managers by department
app.get("/users/managers/:departmentName", async (req, res) => {
  try {
    const { departmentName } = req.params;

    // Find all users who are managers in the specified department
    const managers = await User.find({
      department: departmentName,
      role: "Manager",
    }).select("_id name email"); // Only select necessary fields

    if (!managers || managers.length === 0) {
      return res.status(200).json([]); // Return empty array if no managers found
    }

    res.status(200).json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({
      message: "Error fetching managers",
      error: error.message,
    });
  }
});
// Route to get all departments
app.get("/api/departments", async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
});
app.post("/api/departments/add", async (req, res) => {
  try {
    const { name, description, subDepartments } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: "Department already exists" });
    }

    // Create new department with the schema structure
    const newDepartment = new Department({
      name,
      subDepartments: subDepartments.map((sub) => ({
        name: sub.name,
        description: sub.description,
        employees: [], // Initialize with empty employees array
      })),
      createdAt: new Date(),
    });

    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      message: "Failed to create department",
      error: error.message,
    });
  }
});

app.post("/api/users/add", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();

    const department = await Department.findOne({
      name: req.body.department,
      "subDepartments.name": req.body.subDepartment,
    });

    if (!department) {
      return res
        .status(400)
        .json({ message: "Department or Sub-Department not found" });
    }
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/api/usersData", async (req, res) => {
  const { adminId } = req.body;
  try {
    const users = await User.find({ adminId });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.patch("/api/usersData/:userId", async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  console.log(newPassword, " ", userId);
  try {
    // Find the user by userId and update the password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword }, // Assuming you want to directly set the new password
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

app.post("/api/fetchTaskData", async (req, res) => {
  const { userId } = req.body;

  try {
    // Find tasks where the assignee's userId matches the given userId
    const tasks = await Task.find({ "assignee.userId": userId });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.delete("/api/users/:userId", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/usersData", async (req, res) => {
  const { adminId } = req.body;
  try {
    const users = await User.find({ adminId });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/fetchTaskData", async (req, res) => {
  const { userId } = req.body;

  try {
    // Find tasks where the assignee's userId matches the given userId
    const tasks = await Task.find({ "assignee.userId": userId });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.delete("/api/users/:userId", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Task Routes
app.post("/api/tasks3", async (req, res) => {
  try {
    const task4 = new Task(req.body);
    await task4.save();
    res.status(201).json(task4);
  } catch (error) {
    res.status(400).json({ error: "Failed to create task" });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignee.userId", "name")
      .populate("createdBy", "name");
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.put("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/tasks3", async (req, res) => {
  try {
    const task4 = new Task(req.body);
    console.log("fetched succuesfully ", task4);

    await task4.save();
    console.log("Received task data:", req.body);
    console.log("task done", task4);
    res.status(201).json(task4);
  } catch (error) {
    res.status(400).json({ error: "Failed to create task" });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignee.userId", "name")
      .populate("createdBy", "name");
    res.json(tasks);
    console.log("Received task data:", req.body);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.put("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Get tasks by department
app.get("/api/tasks/department/:department", async (req, res) => {
  try {
    const tasks = await Task.find({ department: req.params.department })
      .populate("assignee.userId", "name")
      .populate("createdBy", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch department tasks" });
  }
});

// Get tasks by assignee
app.get("/api/tasks/assignee/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ "assignee.userId": req.params.userId })
      .populate("assignee.userId", "name")
      .populate("createdBy", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignee tasks" });
  }
});

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Time Log Schema
const timeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  checkIn: { type: Date },
  checkOut: { type: Date },
  duration: { type: Number }, // Total work time in milliseconds
  breaks: [
    {
      start: { type: Date },
      end: { type: Date },
      reason: { type: String },
    },
  ],
});

const TimeLog = mongoose.model("TimeLog", timeLogSchema);

app.post("/api/timelog/checkin", async (req, res) => {
  const { userId } = req.body;

  try {
    // Validate if userId is provided and is a valid ObjectId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    // Ensure the user exists in the User collection
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new TimeLog for the user
    const timeLog = new TimeLog({
      userId,
      checkIn: new Date(),
    });
    await timeLog.save();

    res.status(201).json({ message: "Checked in successfully", timeLog });
  } catch (error) {
    console.error("Error during check-in:", error.message);
    res
      .status(500)
      .json({ message: "Error checking in", error: error.message });
  }
});
app.post("/api/timelog/start-break", async (req, res) => {
  const { userId, reason } = req.body;

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    const timeLog = await TimeLog.findOne({ userId, checkOut: null });
    if (!timeLog) {
      return res.status(404).json({ message: "No active check-in found" });
    }

    timeLog.breaks.push({ start: new Date(), reason });
    await timeLog.save();

    res.status(200).json({ message: "Break started successfully", timeLog });
  } catch (error) {
    console.error("Error starting break:", error.message);
    res
      .status(500)
      .json({ message: "Error starting break", error: error.message });
  }
});

app.post("/api/timelog/end-break", async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    const timeLog = await TimeLog.findOne({ userId, checkOut: null });
    if (!timeLog) {
      return res.status(404).json({ message: "No active check-in found" });
    }

    // Find the last break entry without an end time
    const lastBreak = timeLog.breaks[timeLog.breaks.length - 1];
    if (!lastBreak || lastBreak.end) {
      return res.status(400).json({ message: "No active break found" });
    }

    // Set break end time
    lastBreak.end = new Date();
    await timeLog.save();

    res.status(200).json({ message: "Break ended successfully", timeLog });
  } catch (error) {
    console.error("Error ending break:", error.message);
    res
      .status(500)
      .json({ message: "Error ending break", error: error.message });
  }
});

app.post("/api/timelog/checkout", async (req, res) => {
  const { userId, reason } = req.body; // Include 'reason' if it's part of the request

  try {
    // Validate if userId is provided and is a valid ObjectId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    // Find the most recent TimeLog entry for the user where checkOut is null
    const timeLog = await TimeLog.findOne({ userId, checkOut: null });
    if (!timeLog) {
      return res.status(404).json({ message: "No active check-in found" });
    }

    // If a reason is provided, it indicates the user is starting a break
    if (reason) {
      timeLog.breaks.push({ start: new Date(), reason });
      await timeLog.save();
      return res
        .status(200)
        .json({ message: "Break started successfully", timeLog });
    }

    // Otherwise, proceed with check-out
    timeLog.checkOut = new Date();
    timeLog.duration = timeLog.checkOut - timeLog.checkIn;
    await timeLog.save();

    res.status(200).json({ message: "Checked out successfully", timeLog });
  } catch (error) {
    console.error("Error during check-out or break:", error.message);
    res
      .status(500)
      .json({ message: "Error processing the request", error: error.message });
  }
});

app.post("/api/timelog/end-break", async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    const timeLog = await TimeLog.findOne({ userId, checkOut: null });
    if (!timeLog) {
      return res.status(404).json({ message: "No active check-in found" });
    }

    // Find the last break entry without an end time
    const lastBreak = timeLog.breaks[timeLog.breaks.length - 1];
    if (!lastBreak || lastBreak.end) {
      return res.status(400).json({ message: "No active break found" });
    }

    // Set break end time
    lastBreak.end = new Date();
    await timeLog.save();

    res.status(200).json({ message: "Break ended successfully", timeLog });
  } catch (error) {
    console.error("Error ending break:", error.message);
    res
      .status(500)
      .json({ message: "Error ending break", error: error.message });
  }
});

app.post("/api/timelog/checkout", async (req, res) => {
  const { userId } = req.body;

  try {
    // Validate if userId is provided and is a valid ObjectId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    // Find the most recent TimeLog entry for the user where checkOut is null
    const timeLog = await TimeLog.findOne({ userId, checkOut: null });
    if (!timeLog) {
      return res.status(404).json({ message: "No active check-in found" });
    }

    // Update the TimeLog with check-out time and duration
    timeLog.checkOut = new Date();
    timeLog.duration = timeLog.checkOut - timeLog.checkIn;
    await timeLog.save();

    res.status(200).json({ message: "Checked out successfully", timeLog });
  } catch (error) {
    console.error("Error during check-out:", error.message);
    res
      .status(500)
      .json({ message: "Error checking out", error: error.message });
  }
});
app.get("/api/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId); // Assuming `User` is your MongoDB model
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user details", error: error.message });
  }
});

// Retrieve Logs Route
app.get("/api/timelog/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const logs = await TimeLog.find({ userId }).sort({ checkIn: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving logs", error: error.message });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    // Find user by email
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "your_secret_key", // Replace with an environment variable in production
      { expiresIn: "1h" }
    );

    // Respond with user info and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Register Route (for testing purposes)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    const newUser = new User({ name, email, password, role, department });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/api/timesheets/save_entries", async (req, res) => {
  const { userId, entries } = req.body;

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "No entries provided" });
    }

    const timesheetsToSave = entries.map((entry) => ({
      ...entry,
      userId,
      date: entry.date || new Date(),
      status: "Pending",
    }));

    const savedTimesheets = await Timesheet.insertMany(timesheetsToSave);

    res
      .status(200)
      .json({ message: "Entries saved successfully", savedTimesheets });
  } catch (error) {
    console.error("Error saving timesheets:", error.message);
    res
      .status(500)
      .json({ message: "Error saving timesheets", error: error.message });
  }
});

module.exports = Timesheet;
app.post("/api/timesheets/save_entries", async (req, res) => {
  const { userId, entries } = req.body;

  try {
    // Validate `userId` and `entries`
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "No entries provided" });
    }

    // Prepare entries for saving
    const timesheetsToSave = entries.map((entry) => ({
      ...entry,
      userId,
      date: entry.date || new Date(), // Use provided date or default to now
      status: "Pending",
    }));

    // Save timesheets to MongoDB
    const savedTimesheets = await Timesheet.insertMany(timesheetsToSave);

    res
      .status(200)
      .json({ message: "Entries saved successfully", savedTimesheets });
  } catch (error) {
    console.error("Error saving timesheets:", error.message);
    res
      .status(500)
      .json({ message: "Error saving timesheets", error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
