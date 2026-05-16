import mongoose from 'mongoose';

// The formal structural rulebook for every single task card created
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId, // Connects directly to a specific User profile ID
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Records which Admin built this task
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;