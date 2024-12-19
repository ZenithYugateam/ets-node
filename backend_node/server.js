const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require("body-parser");
const ManagerTask = require("./Models/ManagerTask");
const Worksheet = require("./Models/Worksheet");
const UserDataList = require("./Models/UserList");
const DepartmentList = require('./Models/DepartmentList');
const StudentList = require('./Models/StudentList');
const Clientlist = require('./Models/Clientlist')
const MultiTask = require('./Models/Tasktypes')


const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));

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


  const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: 'sharan.medamoni4243@gmail.com', 
    pass: 'kdmsbrhqqxkbytei', 
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP connection successful:', success);
  }
});


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

app.put("/api/users/edit/:id", async (req, res) => {
  const { id } = req.params; // Extract the user ID from the URL parameters
  const updateData = req.body; // Extract the update data from the request body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//get api for name Userschema
app.post("/api/usersData_total", async (req, res) => {
  try {
    let userId = req.body;
    console.log("......",userId);

    const user = await User.findById(mongoose.Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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


leaveRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

app.post("/api/leave-requests", async (req, res) => {
  try {
    const { type, startDate, endDate, reason, userid, username } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).send("End date cannot be earlier than start date");
    }
   
    const newLeaveRequest = new LeaveRequest({
      type,
      startDate,
      endDate,
      reason,
      userid,
      status: "pending",
      username: username,
    });

    await newLeaveRequest.save();
    res.status(201).send(newLeaveRequest);
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

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
   
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete("/api/leave-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

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

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    bodyParser.json()(req, res, next);
  } else {
    next();
  }
});


const Timesheet = mongoose.model("timesheet", timesheetSchema);
const User = mongoose.model("users", userSchema);

app.get("/api/user/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
app.put("/api/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params; 
  const updatedData = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updatedData }, 
      { new: true, runValidators: true } 
    )
      .populate("assignee.userId", "name") 
      .populate("createdBy", "name"); 

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" }); 
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" }); // General error response
  }
});
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
      .sort({ _id: -1 })
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
// test 
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Assuming User is your Mongoose model
    res.status(200).json(users); // Send back the users
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
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

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

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

app.post("/api/getAllProjectNamesForEmployee", async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    const tasks = await Task.find({ "assignee.userId": userId })
    .select("title")
    .populate("assignee.userId", "name");


    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No projects found for the given userId" });
    }

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error getting project names:", err.message);
    res.status(500).json({ message: "Error getting project names", error: err.message });
  }
});

app.post('/api/employees-by-manager', async (req, res) => {
  const { managerName } = req.body; 
  try {
    const employees = await User.find({
      role: 'Employee',
      manager: managerName,
    }).select('name email department'); 
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ message: 'Error fetching employees', error: err.message });
  }
});

app.post("/api/store-form-data", async (req, res) => {
  try {
    const newTask = new ManagerTask({
      projectName: req.body.projectName,
      projectId: req.body.projectId,
      taskName: req.body.taskName,
      employeeName: req.body.employeeName,
      priority: req.body.priority,
      deadline: req.body.deadline,
      description: req.body.description,
      managerName: req.body.managerName,
      status: req.body.status,
      droneRequired: req.body.droneRequired,
      dgpsRequired : req.body.dgpsRequired,
      selectedEmployees: req.body.selectedEmployees,
      estimatedHours: req.body.estimatedHours,
    });
    
    const savedTask = await newTask.save();

    res.status(201).json({ message: "Task saved successfully", data: savedTask });
  } catch (error) {
    console.error("Error saving task:", error.message);
    res.status(500).json({ message: "Error saving task", error: error.message });
  }
});

app.post("/api/get-task-by-manager-name", async (req, res) => {
  const { managerName } = req.body;
  try {
    const tasks = await ManagerTask.find({ managerName })
    .sort({'_id' : -1});
    res.status(200).json(tasks);

  }catch(error) {
    console.error("Error getting task by manager name:", error.message);
    res.status(500).json({ message: "Error getting task by manager name", error: error.message });
  }
})

app.put("/api/update-remarks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ message: "Remarks cannot be empty" });
    }

    const updatedTask = await ManagerTask.findByIdAndUpdate(
      id,
      { $push: { remarks: remarks } }, 
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/remarks/:id', async (req, res) => {
  try {
    const { id } = req.params; 

    const task = await ManagerTask.findById(id, { remarks: 1 });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ remarks: task.remarks });

  } catch (error) {
    console.error("Error fetching remarks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/tasks/employee", async (req, res) => {
  const { employeeName } = req.body;
  try {
    const tasks = await ManagerTask.find({ employeeName });
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this employee." });
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.put("/api/Employee/notes", async (req, res) => {
  try {
    const {id,  note } = req.body;

    if (!note || typeof note !== 'string') {
      return res.status(400).json({ message: "Note cannot be empty and must be a valid string" });
    }

    const updatedTask = await ManagerTask.findByIdAndUpdate(
      id,
      { $push: { notes: note } }, 
      { new: true } 
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/employeeNotes',async(req, res) =>{ 
  const {id } = req.body;
  try{
    const notes = await ManagerTask.findById(id, { notes: 1 });

    if (!notes) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ notes: notes.notes });
  }catch(error){
    console.error("Error fetching max listeners:", error);
    res.status(500).json({ message: "Server error" });
  }
})

app.post('/api/worksheets', async (req, res) => {
  try {

    const { assign_name, role, assign_to, date, worksheetTitle, worksheetDescription } = req.body;
    
    if (!assign_name || !role || !date || !worksheetTitle || !worksheetDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newWorksheet = new Worksheet({
      assign_name,
      role,
      assign_to,
      date : new Date(),
      worksheetTitle,
      worksheetDescription,
    });

    const savedWorksheet = await newWorksheet.save();
    res.status(201).json({ message: 'Worksheet saved successfully', data: savedWorksheet });
  } catch (error) {
    console.error('Error saving worksheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/user/:id', async (req, res) => {
  try {
    
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/worksheetsData', async (req, res) => {
  const { assign_name } = req.body;
  try {
    const worksheets = await Worksheet.find({ assign_name: assign_name });
   
    if (worksheets.length === 0) {
      return res.status(400).json({ message: 'No worksheets found for this assign_name' });
    }

    res.status(200).json(worksheets);
  } catch (err) {
    console.error('Error fetching worksheets:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/worksheets/manager', async (req, res) => {
  let { assign_to, role } = req.body; 
  console.log("role : ",role.trim());

  if (assign_to === "DEV") assign_to = "";

  try {
    const roleCriteria = role === "Manager" ? ["Employee", "Admin", "Manager"] : [role];
    const worksheets = role === "Manager"
  ? await Worksheet.find({
      role: { $in: roleCriteria },
    }).sort({ _id: -1 }) 
  : await Worksheet.find({
      assign_to: assign_to,
      role: { $in: roleCriteria },
    }).sort({ _id: -1 }); 

    if (worksheets.length === 0) {
      return res.status(404).json({ message: 'No worksheets found for the given criteria.' });
    }

    return res.status(200).json(worksheets);
  } catch (err) {
    console.error('Error fetching worksheets:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put("/api/manager-tasks/update-status", async (req, res) => {
  const { status, id } = req.body; 
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updatedTask = await ManagerTask.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true } 
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Status updated successfully", updatedTask });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

//UserListData
app.post('/api/users/hr', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      company,
      department,
      departmentId,
      otherDepartments = [],
      role,
      manager,
      joinedDate,
    } = req.body;

    // Collect missing fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');
    if (!company) missingFields.push('company');
    if (!department) missingFields.push('department');
    if (!departmentId) missingFields.push('departmentId');
    if (!role) missingFields.push('role');

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Check for duplicate email
    const existingUser = await UserDataList.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Validate that `department` exists
    const departmentExists = await DepartmentList.findOne({ name: department });
    if (!departmentExists) {
      return res.status(400).json({ error: `Invalid department: ${department}` });
    }

    // Validate `otherDepartments`
    if (otherDepartments.length > 0) {
      const invalidDepartments = [];
      for (const deptName of otherDepartments) {
        const isValid = await DepartmentList.findOne({ name: deptName });
        if (!isValid) {
          invalidDepartments.push(deptName);
        }
      }

      if (invalidDepartments.length > 0) {
        return res.status(400).json({
          error: `Invalid departments: ${invalidDepartments.join(', ')}`,
        });
      }
    }

    // Generate a unique empId
    const lastUser = await UserDataList.findOne({ company, departmentId })
      .sort({ empId: -1 })
      .exec();
    let uniqueNumber = '0001';
    if (lastUser) {
      const lastEmpId = lastUser.empId.slice(-4); // Get the last 4 digits
      uniqueNumber = String(parseInt(lastEmpId) + 1).padStart(4, '0'); // Increment and pad
    }

    const empId = `${company}${departmentId}${uniqueNumber}`; // Construct empId

    // Save the user
    const newUser = new UserDataList({
      empId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      company,
      department,
      departmentId,
      otherDepartments, // Save department names directly
      role,
      manager,
      joinedDate: new Date(joinedDate),
    });

    const savedUser = await newUser.save();
    return res.status(201).json({ message: 'User created successfully', data: savedUser });
  } catch (error) {
    console.error('Error creating user:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get user details 
app.get('/api/getusers/hr', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await UserDataList.find({}, '-password'); // Exclude password for security

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.status(200).json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


//maangers hr 
app.get('/api/managers/hr', async (req, res) => {
  try {
    const { department, company } = req.query;

    // Log the incoming query parameters for debugging
    console.log("Query parameters received:", { department, company });

    // Validate query parameters
    if (!department || !company) {
      return res.status(400).json({ error: 'Both department and company are required.' });
    }

    // Query the database for managers
    const managers = await UserDataList.find(
      { role: 'Manager', department, company },
      'name department company email -_id' // Select only the fields needed
    );

    if (!managers || managers.length === 0) {
      return res.status(404).json({
        message: 'No managers found for the selected department and company',
        data: [],
      });
    }

    return res.status(200).json({ data: managers });
  } catch (error) {
    console.error('Error fetching managers:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});




//DepartmentLists 
app.post('/api/departments/hr', async (req, res) => {
  try {
    const { name, company } = req.body;
    console.log("name:", name, "company:", company);

    // Validate input
    if (!name || !company) {
      return res.status(400).json({ error: 'Both department name and company are required' });
    }

    // Validate company name
    const validCompanies = ['IPU', 'IDA']; // Allowed company values
    if (!validCompanies.includes(company)) {
      return res.status(400).json({ error: `Invalid company. Allowed values are: ${validCompanies.join(', ')}` });
    }

    // Create a new department instance
    const newDepartment = new DepartmentList({ name, company });

    // Save the department to the database
    await newDepartment.save();

    res.status(201).json({
      message: 'Department created successfully',
      department: newDepartment,
    });
  } catch (error) {
    console.error('Error creating department:', error); // Log the full error object
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Department name or ID already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
//get departments 

app.get('/api/getdepartments/hr', async (req, res) => {
  try {
    const { company } = req.query; // Get company name from query parameters

    // Validate company parameter
    if (!company) {
      return res.status(400).json({ error: 'Company name is required.' });
    }

    // Fetch departments for the given company
    const departments = await DepartmentList.find({ company }).select('name departmentId');

    if (departments.length === 0) {
      return res.status(200).json({ message: `No departments found for company ${company}`, data: [] });
    }

    // Return the filtered list of departments
    res.status(200).json({ data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error); // Log full error
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


//genetate emp id 
app.get('/api/generate-empid/hr', async (req, res) => {
  try {
    const { company, departmentId } = req.query;

    if (!company || !departmentId) {
      return res.status(400).json({ error: 'Company and department ID are required' });
    }

    // Fetch the last user globally to ensure unique ID across all employees
    const lastUser = await UserDataList.findOne().sort({ empId: -1 }).exec();

    let uniqueNumber = '0001';
    if (lastUser) {
      const lastEmpId = lastUser.empId.slice(-4);
      uniqueNumber = String(parseInt(lastEmpId) + 1).padStart(4, '0');
    }

    const empId = `${company}${departmentId}${uniqueNumber}`;
    res.status(200).json({ empId });
  } catch (error) {
    console.error('Error generating empId:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Student data 

app.post('/api/students', async (req, res) => {
  try {
    // Extract data from request body
    const { name, age, hasPassport, highestQualification, status } = req.body;

    // Validate required fields
    if (!name || !age || !highestQualification || !status) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Create a new student document
    const newStudent = new StudentList({
      name,
      age,
      hasPassport,
      highestQualification,
      status,
    });

    // Save the student to the database
    const savedStudent = await newStudent.save();

    // Respond with success message
    res.status(201).json({ message: 'Student added successfully', data: savedStudent });
  } catch (error) {
    console.error('Error saving student:', error); // Log the full error
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/getstudents/hr', async (req, res) => {
  try {
    const students = await StudentList.find({});
    if (!students.length) {
      return res.status(200).json({ message: 'No students found', data: [] });
    }
    res.status(200).json({ data: students });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

//Clients data
app.post('/api/clients', async (req, res) => {
  try {
    // Extract data from the request body
    const { name, email, phone, company, status } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !company || !status) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Check if email is unique
    const existingClient = await Clientlist.findOne({ email });
    if (existingClient) {
      return res.status(409).json({ error: 'Client with this email already exists.' });
    }

    // Create a new client document
    const newClient = new Clientlist({
      name,
      email,
      phone,
      company,
      status,
    });

    // Save the client to the database
    const savedClient = await newClient.save();

    // Respond with a success message and the saved client data
    res.status(201).json({ message: 'Client added successfully', data: savedClient });
  } catch (error) {
    console.error('Error saving client:', error); // Log the full error
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/getclients', async (req, res) => {
  try {
    const clients = await Clientlist.find();
    res.status(200).json({ data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

//task types  
app.post('/api/multitasks/hr', async (req, res) => {
  try {
    const { company, tasks } = req.body;

    // Validate company
    if (!company || !['IDA', 'IPU'].includes(company)) {
      return res.status(400).json({ error: 'A valid company is required (IDA or IPU).' });
    }

    // Validate tasks
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'At least one task is required.' });
    }

    // Validate individual tasks
    for (const task of tasks) {
      if (!task.name || !task.department) {
        return res
          .status(400)
          .json({ error: 'Each task must have a name and a department.' });
      }
    }

    // Create a new MultiTask instance
    const newMultiTask = new MultiTask({ company, tasks });

    // Save the MultiTask instance to the database
    await newMultiTask.save();

    res.status(201).json({
      message: 'Tasks saved successfully',
      data: newMultiTask,
    });
  } catch (error) {
    console.error('Error saving tasks:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

                                                
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

