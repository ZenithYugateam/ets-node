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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}...`);
});









