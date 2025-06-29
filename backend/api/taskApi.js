const express = require('express');
const router = express.Router();
const Task = require('../models/taskModel');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({}).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
    const { content, localDate } = req.body;

    try {
        const task = await Task.create({ content, localDate });
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

// GET tasks by date (YYYY-MM-DD)
router.get('/by-date/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const tasks = await Task.find({ localDate: date }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all unique task dates
router.get('/dates', async (req, res) => {
    try {
        const dates = await Task.distinct('localDate');
        res.status(200).json(dates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
