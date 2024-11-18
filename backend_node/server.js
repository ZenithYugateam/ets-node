const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/ETS", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to the ETS database successfully");
})
.catch((error) => {
    console.error("Error connecting to the ETS database:", error);
});

// Schemas
const timesheetSchema = new mongoose.Schema({
    date: Date,
    entries: [{
        project: String,
        hours: Number,
        description: String,
        task: String
    }]
});

const userSchema = new mongoose.Schema({
    adminId: { type: String }, 
    name: String,
    password: String,
    email: String,
    role: String,
    department: String,
    manager : {type : String ,default : ''},
    status: String,
    delete: Boolean,
    subDepartment: { type: String, default : '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    assignee: {
        userId: { type: String, default :'' },
        name: { type: String, required: true },
        avatar: { type: String, default: '' },
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    deadline: { type: Date, required: false },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    progress: { type: Number, default: 0 },
    department: { type: String },
    description:{type:String}
});

const Task = mongoose.model('Task', taskSchema);

// Models
const Timesheet = mongoose.model('timesheet', timesheetSchema);
const User = mongoose.model('users', userSchema);


// Timesheet Routes
app.post('/api/save_entries', async (req, res) => {
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
app.post('/api/users/add', async (req, res) => {
    console.log("respinsefrom teh server : "  + req.body);
    try {
        const user = new User(req.body);
        await user.save();
        console.log("give me update");
        return res.status(200).send("User added successfully");
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/api/usersData', async (req, res) => {
    const { adminId } = req.body;
    try {
        const users = await User.find({ adminId });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/fetchTaskData', async (req, res) => {
    const { userId } = req.body;

    try {
        // Find tasks where the assignee's userId matches the given userId
        const tasks = await Task.find({ 'assignee.userId': userId });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});


app.delete('/api/users/:userId', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Task Routes
app.post('/api/tasks3', async (req, res) => {
    try {
        const task4 = new Task(req.body);
        console.log("fetched succuesfully ",task4);

        await task4.save();
        console.log("Received task data:", req.body);
        console.log("task done",task4);
        res.status(201).json(task4);

        
    } catch (error) {
        res.status(400).json({ error: 'Failed to create task' });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignee.userId', 'name')
            .populate('createdBy', 'name');
        res.json(tasks);
        console.log("Received task data:", req.body);

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.put('/api/tasks/:taskId', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.taskId,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Get tasks by department
app.get('/api/tasks/department/:department', async (req, res) => {
    try {
        const tasks = await Task.find({ department: req.params.department })
            .populate('assignee.userId', 'name')
            .populate('createdBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch department tasks' });
    }
});

// Get tasks by assignee
app.get('/api/tasks/assignee/:userId', async (req, res) => {
    try {
        const tasks = await Task.find({ 'assignee.userId': req.params.userId })
            .populate('assignee.userId', 'name')
            .populate('createdBy', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignee tasks' });
    }
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Time Log Schema
const timeLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
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
  
  
  const TimeLog = mongoose.model('TimeLog', timeLogSchema);
  
  app.post('/api/timelog/checkin', async (req, res) => {
    const { userId } = req.body;
  
    try {
      // Validate if userId is provided and is a valid ObjectId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid or missing User ID' });
      }
  
      // Ensure the user exists in the User collection
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create a new TimeLog for the user
      const timeLog = new TimeLog({
        userId,
        checkIn: new Date(),
      });
      await timeLog.save();
  
      res.status(201).json({ message: 'Checked in successfully', timeLog });
    } catch (error) {
      console.error('Error during check-in:', error.message);
      res.status(500).json({ message: 'Error checking in', error: error.message });
    }
  });
  app.post('/api/timelog/start-break', async (req, res) => {
    const { userId, reason } = req.body;
  
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid or missing User ID' });
      }
  
      const timeLog = await TimeLog.findOne({ userId, checkOut: null });
      if (!timeLog) {
        return res.status(404).json({ message: 'No active check-in found' });
      }
  
      timeLog.breaks.push({ start: new Date(), reason });
      await timeLog.save();
  
      res.status(200).json({ message: 'Break started successfully', timeLog });
    } catch (error) {
      console.error('Error starting break:', error.message);
      res.status(500).json({ message: 'Error starting break', error: error.message });
    }
  });
  
  app.post('/api/timelog/end-break', async (req, res) => {
    const { userId } = req.body;
  
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid or missing User ID' });
      }
  
      const timeLog = await TimeLog.findOne({ userId, checkOut: null });
      if (!timeLog) {
        return res.status(404).json({ message: 'No active check-in found' });
      }
  
      // Find the last break entry without an end time
      const lastBreak = timeLog.breaks[timeLog.breaks.length - 1];
      if (!lastBreak || lastBreak.end) {
        return res.status(400).json({ message: 'No active break found' });
      }
  
      // Set break end time
      lastBreak.end = new Date();
      await timeLog.save();
  
      res.status(200).json({ message: 'Break ended successfully', timeLog });
    } catch (error) {
      console.error('Error ending break:', error.message);
      res.status(500).json({ message: 'Error ending break', error: error.message });
    }
  });
  
  app.post('/api/timelog/checkout', async (req, res) => {
    const { userId } = req.body;
  
    try {
      // Validate if userId is provided and is a valid ObjectId
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid or missing User ID' });
      }
  
      // Find the most recent TimeLog entry for the user where checkOut is null
      const timeLog = await TimeLog.findOne({ userId, checkOut: null });
      if (!timeLog) {
        return res.status(404).json({ message: 'No active check-in found' });
      }
  
      // Update the TimeLog with check-out time and duration
      timeLog.checkOut = new Date();
      timeLog.duration = timeLog.checkOut - timeLog.checkIn;
      await timeLog.save();
  
      res.status(200).json({ message: 'Checked out successfully', timeLog });
    } catch (error) {
      console.error('Error during check-out:', error.message);
      res.status(500).json({ message: 'Error checking out', error: error.message });
    }
  });
  
  
  // Retrieve Logs Route
  app.get('/api/timelog/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const logs = await TimeLog.find({ userId }).sort({ checkIn: -1 });
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving logs', error: error.message });
    }
  });
  

// Login Route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Validate password
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        'your_secret_key', // Replace with an environment variable in production
        { expiresIn: '1h' }
      );
  
      // Respond with user info and token
      res.status(200).json({
        message: 'Login successful',
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
      console.error('Error during login:', error.message);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  
  // Register Route (for testing purposes)
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, department } = req.body;
  
    try {
      const newUser = new User({ name, email, password, role, department });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during registration:', error.message);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
  
  // Default Route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
  
  // Start Server
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));









