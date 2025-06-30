const express = require('express');
const router = express.Router();
const Mood = require('../models/moodModel');
const moment = require('moment-timezone');

// GET all moods for a user
router.get('/', async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: 'userId query param is required' });
        }
        const moods = await Mood.find({ userId: req.query.userId }).sort({ createdAt: -1 });
        res.json(moods);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET the latest mood
router.get('/latest', async (req, res) => {
    try {
        const latestMood = await Mood.findOne().sort({ createdAt: -1 });
        if (!latestMood) {
            return res.status(404).json({ message: 'No mood entries found' });
        }
        res.status(200).json(latestMood);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a mood by date for a user
router.get('/by-date/:date', async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: 'userId query param is required' });
        }
        const mood = await Mood.findOne({
            localDate: req.params.date,
            userId: req.query.userId,
        });
        if (mood == null) {
            return res.status(404).json({ message: 'Cannot find mood for this date' });
        }
        res.json(mood);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new mood
router.post('/', async (req, res) => {
    const mood = new Mood({
        mood: req.body.mood,
        localDate: req.body.localDate,
        userId: req.body.userId,
    });
    try {
        const newMood = await mood.save();
        res.status(201).json(newMood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
