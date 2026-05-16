import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. CREATE A TASK (Admin Only)
router.post('/create', protect, authorize('Admin'), async (req, res) => {
  try {
    const { title, description, assignedToEmail } = req.body;

    const member = await User.findOne({ email: assignedToEmail, role: 'Member' });
    if (!member) {
      return res.status(404).json({ message: 'Team member with this email not found!' });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo: member._id,
      createdBy: req.user._id
    });

    await newTask.save();
    res.status(201).json({ message: 'Task assigned and created successfully! 📋🚀', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task.', error: error.message });
  }
});

// 2. GET ALL RELEVANT TASKS (Populates details for both Admins and Members)
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'Admin') {
      tasks = await Task.find().populate('assignedTo', 'name email').populate('createdBy', 'name');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('createdBy', 'name');
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
});

// 3. UPDATE TASK STATUS (Admin & Assigned Members Only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update option.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied! You can only update your own assigned tasks.' });
    }

    task.status = status;
    await task.save();

    res.json({ message: 'Task status updated cleanly! 🔄', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task status.', error: error.message });
  }
});

export default router;