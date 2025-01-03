const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const multer = require('multer');
const bodyParser = require("body-parser");
const ManagerTask = require("./Models/ManagerTask");
const Worksheet = require("./Models/Worksheet")
const BugReport = require("./Models/BugReport")
const Vehicle = require("./Models/Vehicle")
const SubmissionSchema = require("./Models/SubmissionSchema");

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));
require('dotenv').config()
mongoose
  .connect(
    process.env.MONGO_URL,
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


const userSchema = new mongoose.Schema(
  {
    adminId: { type: String }, // ID of the admin creating the user
    name: { type: String, required: true, trim: true }, // User's name with trimming to remove excess spaces
    password: { type: String, required: true }, // Hashed password should be stored (consider bcrypt for hashing)
    email: { type: String, required: true, unique: true, lowercase: true }, // Ensure email is unique and case-insensitive
    phone: { 
      type: String, 
      required: true, // Make phone number required
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"] // Add validation for 10-digit phone number
    },
    role: { type: String, required: true, enum: ["Admin", "Manager", "Employee"] }, // Ensure role is limited to valid options
    departments: [{ type: String, required: true }], // Array of department names
    subDepartments: [{ type: String }], // Array of sub-department names
    managers: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        _id: false, // Prevent creating new _id for each manager entry
      },
    ], // Array of manager objects (with validation for name and id)
    status: { type: String, required: true, enum: ["active", "inactive"] }, // User status with only valid options
    deleted: { type: Boolean, default: false }, // Logical deletion flag
    createdAt: { type: Date, default: Date.now }, // Auto-set on creation
    updatedAt: { type: Date, default: Date.now }, // Auto-set on update
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);


const taskSchema = new mongoose.Schema(
  {
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
    completedAt: { type: Date, default: null }, // New field for completion time
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for timeRemaining
taskSchema.virtual("timeRemaining").get(function () {
  if (this.status === "Completed" || !this.deadline) {
    return null;
  }
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    return "Expired";
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
});
const Task = mongoose.model("Task", taskSchema);


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

    // Validate required fields
    if (!type || !startDate || !endDate || !reason || !userid || !username) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate date format and comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (start > end) {
      return res.status(400).json({ message: "End date cannot be earlier than start date." });
    }

    // Create and save the leave request
    const newLeaveRequest = new LeaveRequest({
      type,
      startDate,
      endDate,
      reason,
      userid,
      status: "pending",
      username,
    });

    const savedRequest = await newLeaveRequest.save();

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating leave request:", error); // Log the detailed error stack
    res.status(500).json({ message: `Error creating leave request: ${error.message}` });
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
    const user = await User.findById(id).select("name role departments"); // Explicitly select name, role, and departments

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      name: user.name,
      role: user.role,
      departments: user.departments || [], // Ensure departments is included as an array
    });
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
  const updateData = req.body;

  try {
    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if status is being updated
    if (updateData.status) {
      if (updateData.status === "Completed" && task.status !== "Completed") {
        // If status is being set to "Completed", set completedAt
        updateData.completedAt = new Date();
      } else if (task.status === "Completed" && updateData.status !== "Completed") {
        // If status is being changed from "Completed" to something else, remove completedAt
        updateData.completedAt = null;
      }
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("assignee.userId", "name")
      .populate("createdBy", "name");

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task", details: error.message });
  }
});

app.get("/users/managers", async (req, res) => {
  try {
    const { departments } = req.query;

    // Validate query parameter
    if (!departments) {
      console.log("No departments provided in the request.");
      return res.status(400).json({ message: "Departments are required" });
    }

    // Parse and trim departments
    const departmentList = departments.split(",").map((d) => d.trim());
    console.log("Fetching managers for departments:", departmentList);

    // Query to find managers in the specified departments
    const query = {
      role: "Manager", // Ensure only managers are fetched
      departments: { $in: departmentList }, // Match any department in the list
    };

    // Execute query
    const managers = await User.find(query).select("_id name email departments");

    // Check if any managers were found
    if (!managers || managers.length === 0) {
      console.log("No managers found for departments:", departmentList);
      return res.status(404).json({ message: "No managers found" });
    }

    console.log("Managers found:", managers);
    res.status(200).json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error.message);
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

// Import necessary modules

// Define the API
app.post("/api/users/add", async (req, res) => {
  try {
    const {
      adminId,
      name,
      email,
      password,
      phone,
      role,
      departments,
      subDepartments,
      managers,
      status,
    } = req.body;
    // nithin
    // Debugging logs
    console.log("Request Body:", req.body);

    // Validate required fields
    if (!name || !email || !password || !phone || !role || !departments || departments.length === 0) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address. Please provide a valid email." });
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number. Please provide a valid 10-digit phone number." });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let managerDetails = [];
    if (role === "Employee" && managers) {
      // Validate that each manager exists in the database
      const validManagers = await User.find({
        _id: { $in: managers.map((manager) => manager.id) },
        role: "Manager",
      });

      if (validManagers.length !== managers.length) {
        return res.status(400).json({ message: "Some managers are invalid or do not exist." });
      }

      // Map valid managers to store both ID and name
      managerDetails = validManagers.map((manager) => ({
        id: manager._id,
        name: manager.name,
      }));
    }

    // Create a new user
    const newUser = new User({
      adminId,
      name,
      email,
      phone,
      password,
      role,
      departments,
      subDepartments: subDepartments || [],
      managers: role === "Employee" ? managerDetails : [], // Store both ID and name
      status: status || "active",
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: `${role} created successfully`,
      user: savedUser,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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
// In server.js
app.put("/api/tasks/accept/:id", async (req, res) => {
  try {
    const { accepted, acceptedAt } = req.body; 

    const updatedTask = await ManagerTask.findByIdAndUpdate(
      req.params.id,
      { accepted, acceptedAt },
      { new: true } // return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.json(updatedTask);
  } catch (error) {
    console.error("Error accepting task:", error);
    return res.status(500).json({ message: "Server error" });
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


app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // Replace with an environment variable in production
      { expiresIn: "1h" }
    );

    // Handle department field based on schema type
    const department =
      Array.isArray(user.departments) && user.departments.length > 0
        ? user.departments
        : user.department || []; // Fallback for single department

    // Respond with user info and token
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departments: department, // Ensures array format for departments
      },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});


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
    // Step 1: Get employees managed by the manager
    const employees = await User.find({
      role: 'Employee',
      managers: { $elemMatch: { name: { $in: managerName } } }, // Match the `name` field in the `managers` array
    }).select('name email department');
    

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: 'No employees found under this manager' });
    }

    // Extract employee names
    const employeeNames = employees.map(emp => emp.name);

    // Step 2: Fetch tasks assigned to these employees
    const tasks = await ManagerTask.find({
      employees: { $in: employeeNames },
    });

    // Step 3: Group tasks by employee name
    const tasksGroupedByEmployee = tasks.reduce((acc, task) => {
      task.employees.forEach(employeeName => {
        if (!acc[employeeName]) {
          acc[employeeName] = [];
        }
        acc[employeeName].push(task);
      });
      return acc;
    }, {});

    // Step 4: Generate the result with task counts and status
    const result = employees.map(emp => {
      const employeeTasks = tasksGroupedByEmployee[emp.name] || [];
      const pendingTasksCount = employeeTasks.filter(task =>
        ['Pending', 'In Progress'].includes(task.status)
      ).length;

      return {
        name: emp.name,
        email: emp.email,
        department: emp.department,
        status: pendingTasksCount > 0 ? `${pendingTasksCount}` : '0',
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching employees work status:', err.message);
    res.status(500).json({ message: 'Error fetching employees work status', error: err.message });
  }
});


// Adjust the path to your model

app.post("/api/store-form-data", async (req, res) => {
  try {
    // Create a new ManagerTask instance with the incoming payload
    const newTask = new ManagerTask({
      projectName: req.body.projectName,
      projectId: req.body.projectId,
      taskName: req.body.taskName,
      employeeName: req.body.employeeName,
      employeeDepartment: req.body.employeeDepartment,
      employees: req.body.employees,
      priority: req.body.priority,
      deadline: req.body.deadline,
      description: req.body.description,
      managerName: req.body.managerName,
      status: req.body.status,
      droneRequired: req.body.droneRequired,
      dgpsRequired: req.body.dgpsRequired,
      estimatedHours: req.body.estimatedHours,
      remarks: req.body.remarks,
      notes: req.body.notes,
    });

    // Save the task to the database
    const savedTask = await newTask.save();

    // Respond with success
    res.status(201).json({ message: "Task saved successfully", data: savedTask });
  } catch (error) {
    console.error("Error saving task:", error);
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
  const { employeeName, departments } = req.body;

  // Validate input
  if (!employeeName || !Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({ message: "Employee name and valid departments are required." });
  }

  try {
      // Query tasks assigned to the employee and matching any of the departments
      const tasks = await ManagerTask.find({
          employees: { $in: [employeeName] }, // Matches tasks assigned to the employee
          employeeDepartment: { $in: departments }, // Matches tasks in these departments
      });

      if (!tasks || tasks.length === 0) {
          return res.status(404).json({ message: "No tasks found for the given employee and departments." });
      }

      res.status(200).json(tasks);
  } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Internal server error.", error: error.message });
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
  const { assign_to, role } = req.body;

  // Log inputs for debugging
  console.log("Role received:", role);
  console.log("Assign_to received:", assign_to);

  try {
    // Define role criteria based on the role
    let query;
    if (role === "Manager") {
      // Manager sees worksheets submitted to them by employees
      query = { assign_to, role: { $in: ["Employee"] } };
    } else if (role === "Admin") {
      // Admin sees all worksheets
      query = {}; // No filtering; fetch all worksheets
    } else {
      // Other roles, e.g., Employee
      query = { role: role.trim() };
    }

    // Fetch worksheets based on the query
    const worksheets = await Worksheet.find(query).sort({ date: -1 }); // Sort by date in descending order

    // No worksheets found
    if (!worksheets || worksheets.length === 0) {
      return res.status(404).json({ message: 'No worksheets found for the given criteria.' });
    }

    // Successful response
    return res.status(200).json(worksheets);
  } catch (err) {
    console.error('Error fetching worksheets:', err);
    return res.status(500).json({ message: 'Server error occurred while fetching worksheets.' });
  }
});


app.put("/api/manager-tasks/update-status", async (req, res) => {
  const { status, id } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // If the new status is "Completed", calculate how many hours it took
    if (status === "Completed") {
      const task = await ManagerTask.findById(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Only compute if the task was accepted
      if (task.accepted && task.acceptedAt) {
        const now = new Date();              // current date/time
        const acceptedTime = new Date(task.acceptedAt).getTime();
        const hoursTaken = (now.getTime() - acceptedTime) / (1000 * 60 * 60); // in hours

        // Update the task with "Completed" status, how many hours used, and when it completed
        const updated = await ManagerTask.findByIdAndUpdate(
          id,
          { 
            status: "Completed",
            completedTime: hoursTaken, // total hours used
            completedAt: now,          // date/time it finished
          },
          { new: true }
        );

        return res.status(200).json({
          message: "Task completed successfully",
          updatedTask: updated,
        });
      }

      // If not accepted or no acceptedAt, we can still mark it completed,
      // but completedTime won't be computed
      const fallbackTask = await ManagerTask.findByIdAndUpdate(
        id,
        { status: "Completed", completedAt: new Date() },
        { new: true }
      );
      
      return res.status(200).json({
        message: "Task completed (without acceptance time).",
        updatedTask: fallbackTask,
      });
    }

    // If it's not "Completed" status, just update normally
    const updatedTask = await ManagerTask.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      updatedTask,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});




app.post('/api/bug-report', async (req, res) => {
  try {
    console.log("Bug report request received");
    const { username, role, img, description } = req.body;

    console.log("username ", username, role, description);

    if (!img || img.length === 0 || !description) {
      return res.status(400).json({ message: 'Images and description are required.' });
    }

    const newBugReport = new BugReport({
      username,
      role,
      img,
      description,
    });

    await newBugReport.save();

    // Decode base64 images and prepare attachments
    const attachments = img.map((base64Image, index) => {
      let mimeType = 'image/jpeg'; // Default MIME type
      let base64Data = base64Image;

      const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      try {
        const buffer = Buffer.from(base64Data, 'base64');
        return {
          filename: `image${index + 1}.${mimeType.split('/')[1]}`,
          content: buffer,
          contentType: mimeType,
        };
      } catch (err) {
        throw new Error(`Invalid Base64 format for image ${index + 1}`);
      }
    });

    const mailOptions = {
      from: '"Bug Report" <sharan.medamoni4243@gmail.com>', // Sender address
      to: 'temporary34576@gmail.com',
      subject: 'Bug Report Submitted',
      text: `A bug report was submitted by ${username}.

      Role: ${role}
      
      Description:
        ${description}`,
          html: `
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Description:</strong> ${description}</p>
          `,
          attachments, 
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Bug report submitted successfully!', data: newBugReport });
  } catch (error) {
    console.error('Error saving bug report:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { type, name, role, vehicleName, vehicleNumber, startReading, endReading } = req.body;

    if (!type || !name || !role || !vehicleName || !vehicleNumber) {
      return res.status(400).json({ error: 'Type, name, role, vehicle name, and vehicle number are required.' });
    }

    const newVehicle = new Vehicle({
      type,
      name,
      role,
      vehicleName,
      vehicleNumber,
      startReading: startReading || '0',
      endReading: endReading || '0',
    });

    await newVehicle.save();

    res.status(201).json({ message: 'Vehicle saved successfully', vehicle: newVehicle });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Vehicle number already exists.' });
    } else {
      res.status(500).json({ error: 'Error saving vehicle', details: error.message });
    }
  }
});


app.get('/api/getAllVechileData' , (req, res)=>{
  try{
    Vehicle.find({ type: { $ne: 'Private' } }).then(data => {
      res.status(200).json(data);
    }).catch(error => {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Server error" });
    });

  }catch(error){
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
})

app.post('/api/latest-active-step', async (req, res) => {
  try {
    const { managerTaskId } = req.body;
    const submission = await SubmissionSchema.findOne(
      { managerTaskId: managerTaskId },
      { currentStep: 1, _id: 0 } 
    ).sort({ currentStep: -1 }); 
    
    if (!submission) {
      return res.status(404).json({ message: 'No submission found with the given managerTaskId' });
    }

    return res.status(200).json({ latestActiveStep: submission.currentStep });
  } catch (error) {
    console.error('Error fetching latest active step:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/submissions/selected-vehicles', async (req, res) => {
  try {
    const { managerTaskId } = req.body;

    const submission = await SubmissionSchema.findOne({
      managerTaskId: managerTaskId,
      currentStep: 1
    });

    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found for the given managerTaskId and currentStep=2' 
      });
    }

    res.json({ selectedVehicles: submission.selectedVehicles || [] });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/droneDetailsList', async (req, res) => {
  const { managerTaskId } = req.body;

  if (!managerTaskId) {
    return res.status(400).json({ error: 'managerTaskId is required' });
  }

  try {
    const submissions = await SubmissionSchema.find({
      managerTaskId,
      currentStep: 0
    });

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for the given managerTaskId with currentStep = 0' });
    }

    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/submission', async (req, res) => {
  try {
    const { type, onFieldDetails, ...data } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Type field is required to differentiate the submission.' });
    }

    let formattedData = {};

    if (type === "combinedFlightForm") {
      // Combined form handling for "beforeFlight" and "afterFlight"
      if (!data.crew || !data.method || !data.sightName || !data.flights) {
        return res.status(400).json({ error: 'Required fields for combinedFlightForm are missing.' });
      }

      formattedData = {
        type,
        crew: data.crew,
        method: data.method,
        sightName: data.sightName,
        date: data.date,
        flights: data.flights.map((flight) => ({
          flightNo: flight.flightNo,
          takeoffTime: flight.takeoffTime,
          landingTime: flight.landingTime || null, // Handle optional fields
        })),
        images: data.images,
        currentStep: data.currentStep,
        managerTaskId: data.managerTaskId,
      };
    } else if (type === "onFieldDetails") {
      // Handling onFieldDetails type
      if (!onFieldDetails || !onFieldDetails.location) {
        return res.status(400).json({ error: 'onFieldDetails with location data is required for this type.' });
      }

      const { location, isReporting } = onFieldDetails;

      formattedData = {
        type,
        ...data,
        location: {
          latitude: location.latitude || null,
          longitude: location.longitude || null,
        },
        isReporting: isReporting || false,
      };
    } else if (type === "gettingOffField") {
      if (!onFieldDetails || !onFieldDetails.location) {
        return res.status(400).json({ error: 'onFieldDetails with location data is required for this type.' });
      }

      const { location, departingTime, currentStep } = onFieldDetails;

      formattedData = {
        type,
        ...data,
        location: {
          latitude: location.latitude || null,
          longitude: location.longitude || null,
        },
        departingTime: departingTime || null,
        currentStep: currentStep || null,
      };
    } else if (type === "returnToOffice") {
      formattedData = {
        type,
        selectedVehicles: data.selectedVehicles,
        timeReached: data.timeReached,
        endReading: data.endReading,
        images: data.images,
        currentStep: data.currentStep,
        managerTaskId: data.managerTaskId,
      };
    } else if (type === "DroneSubmitForm") {
      if (!data.checkedItems) {
        return res.status(400).json({ error: 'checkedItems are required for DroneSubmitForm.' });
      }
      formattedData = {
        type,
        checkedItems: data.checkedItems,
        managerTaskId: data.managerTaskId,
        currentStep: data.currentStep,
      };
    } else if (type === "Submission_task_final") {
      formattedData = {
        type,
        managerTaskId: data.managerTaskId,
        currentStep: data.currentStep,
        status: data.status,
      };
    } else {
      formattedData = {
        type,
        ...data,
      };
    }

    // Save submission
    const submission = new SubmissionSchema(formattedData);
    const savedSubmission = await submission.save();

    res.status(201).json({
      message: 'Submission stored successfully!',
      data: savedSubmission,
    });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: 'Failed to store submission.' });
  }
});


app.post('/api/getPrivateVehiclesByName', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    const privateVehicles = await Vehicle.find({ type: 'Private', name: name });

    if (privateVehicles.length === 0) {
      return res.status(404).json({ message: 'No private vehicles found for the given name' });
    }

    res.status(200).json(privateVehicles);
  } catch (error) {
    console.error('Error fetching private vehicles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/api/get/latest-active-step/:managerTaskId', async (req, res) => {
  try {
    const { managerTaskId } = req.params;

    const submission = await SubmissionSchema.findOne(
      { managerTaskId },
      { currentStep: 1, _id: 0 }
    ).sort({ currentStep: -1 });

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for the given managerTaskId' });
    }

    return res.status(200).json({ latestActiveStep: submission.currentStep });
  } catch (error) {
    console.error('Error fetching latest active step:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.get('/api/get/submissions/selected-vehicles/:managerTaskId', async (req, res) => {
  try {
    const { managerTaskId } = req.params;

    const submission = await SubmissionSchema.findOne({
      managerTaskId,
      currentStep: 1,
    });

    if (!submission) {
      return res.status(404).json({
        message: 'Submission not found for the given managerTaskId and currentStep=1',
      });
    }

    res.json({ selectedVehicles: submission.selectedVehicles || [] });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/droneDetailsList/:managerTaskId', async (req, res) => {
  const { managerTaskId } = req.params;

  if (!managerTaskId) {
    return res.status(400).json({ error: 'managerTaskId is required' });
  }

  try {
    const submissions = await SubmissionSchema.find({
      managerTaskId,
      currentStep: 0
    });

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for the given managerTaskId with currentStep = 0' });
    }

    return res.json(submissions);
  } catch (error) {
    console.error('Error fetching drone details:', error);
    return res.status(500).json({ error: error.message });
  }
});
//get api for vehicles
app.get('/api/submissions/selected-vehicles/:managerTaskId', async (req, res) => {
  try {
    const { managerTaskId } = req.params;

    // Fetch submission based on managerTaskId and currentStep=1
    const submission = await SubmissionSchema.findOne({
      managerTaskId,
      currentStep: 1,
    });

    if (!submission) {
      return res.status(404).json({
        message: 'Submission not found for the given managerTaskId and currentStep=1',
      });
    }

    res.json({
      selectedVehicles: submission.selectedVehicles || [],
      date: submission.date || null,
      time: submission.time || null,
      readings: submission.readings || null,
      images: submission.images || [],
      publicTransportDetails: submission.submissions.publicTransportDetails || null,
      privateVehicleDetails: submission.submissions.privateVehicleDetails || null,
      privateVehicleNumber: submission.submissions.privateVehicleNumber || null,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/get/submissions/:managerTaskId/:type', async (req, res) => {
  try {
    const { managerTaskId, type } = req.params;

    const submission = await SubmissionSchema.findOne({
      managerTaskId,
      type,
    });

    if (!submission) {
      return res.status(404).json({
        message: `Submission not found for managerTaskId: ${managerTaskId} and type: ${type}`,
      });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/get/private-vehicles/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const privateVehicles = await Vehicle.find({ type: 'Private', name });

    if (privateVehicles.length === 0) {
      return res.status(404).json({
        message: `No private vehicles found for the name: ${name}`,
      });
    }

    res.status(200).json(privateVehicles);
  } catch (error) {
    console.error('Error fetching private vehicles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get("/api/task/:managerTaskId/drone-details", async (req, res) => {
  const { managerTaskId } = req.params;

  try {
    // Query the Submission collection to find the specific drone details
    const droneDetails = await Submission.findOne({
      managerTaskId,
      type: "DroneDetails", // Filter by type to ensure we get the correct submission
    });

    if (!droneDetails) {
      return res
        .status(404)
        .json({ message: "Drone details not found for the given managerTaskId." });
    }

    res.status(200).json(droneDetails);
  } catch (error) {
    console.error("Error fetching drone details:", error);
    res.status(500).json({ message: "Error fetching drone details." });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const { type, managerTaskId, currentStep } = req.query;

    if (!type) {
      return res.status(400).json({ error: 'Type field is required to fetch submissions.' });
    }

    // Build the query dynamically based on the provided parameters
    const query = { type };
    if (managerTaskId) query.managerTaskId = managerTaskId;
    if (currentStep) query.currentStep = parseInt(currentStep, 10);

    // Fetch the submissions matching the query
    const submissions = await SubmissionSchema.find(query);

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for the given criteria.' });
    }

    res.status(200).json({
      message: 'Submissions fetched successfully!',
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});
app.get("/api/manager-tasks", async (req, res) => {
  try {
    const tasks = await ManagerTask.find(); // Fetch all tasks from the database

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found" });
    }

    res.status(200).json({ message: "Tasks fetched successfully", tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});
app.get('/api/private-vehicles/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    const privateVehicles = await Vehicle.find({ type: 'Private', name: name });

    if (privateVehicles.length === 0) {
      return res.status(404).json({ message: 'No private vehicles found for the given name' });
    }

    res.status(200).json(privateVehicles);
  } catch (error) {
    console.error('Error fetching private vehicles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/selected-vehicles/:managerTaskId', async (req, res) => {
  try {
    const { managerTaskId } = req.params;

    const submission = await SubmissionSchema.findOne({
      managerTaskId: managerTaskId,
      currentStep: 1,
    });

    if (!submission) {
      return res.status(404).json({
        message: 'Submission not found for the given managerTaskId and currentStep=1',
      });
    }

    res.json({ selectedVehicles: submission.selectedVehicles || [] });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'No vehicles found' });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/get/submissions', async (req, res) => {
  try {
    const { type, managerTaskId, currentStep } = req.query; // Retrieve query parameters

    // Build a dynamic filter based on the provided query parameters
    const filter = {};
    if (type) filter.type = type;
    if (managerTaskId) filter.managerTaskId = managerTaskId;
    if (currentStep) filter.currentStep = parseInt(currentStep, 10);

    const submissions = await SubmissionSchema.find(filter); // Fetch submissions based on the filter

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for the given criteria.' });
    }

    res.status(200).json({
      message: 'Submissions retrieved successfully!',
      data: submissions,
    });
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
});





const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);