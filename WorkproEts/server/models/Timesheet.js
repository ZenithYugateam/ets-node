import mongoose from 'mongoose';

const timesheetEntrySchema = new mongoose.Schema({
  project: {
    type: String,
    required: true
  },
  task: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  description: String,
  date: {
    type: Date,
    required: true
  }
});

const timesheetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  entries: [timesheetEntrySchema],
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

timesheetSchema.pre('save', function(next) {
  this.totalHours = this.entries.reduce((total, entry) => total + entry.hours, 0);
  next();
});

export default mongoose.model('Timesheet', timesheetSchema);