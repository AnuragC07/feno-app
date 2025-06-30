const express = require('express');
const router = express.Router();
const Task = require('../models/taskModel');

// GET all tasks for a user
router.get('/', async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: 'userId query param is required' });
        }
        const tasks = await Task.find({ userId: req.query.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new task
router.post('/', async (req, res) => {
    const { content, localDate, userId } = req.body;

    try {
        const task = await Task.create({ content, localDate, userId });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET tasks by date for a user
router.get('/by-date/:date', async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: 'userId query param is required' });
        }
        const tasks = await Task.find({
            localDate: req.params.date,
            userId: req.query.userId,
        }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all dates with tasks for a user
router.get('/dates', async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: 'userId query param is required' });
        }
        const dates = await Task.distinct('localDate', {
            userId: req.query.userId,
        });
        res.status(200).json(dates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function getTask(req, res, next) {
    let task;
    try {
        task = await Task.findById(req.params.id);
        if (task == null) {
            return res.status(404).json({ message: 'Cannot find task' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.task = task;
    next();
}

module.exports = router;
