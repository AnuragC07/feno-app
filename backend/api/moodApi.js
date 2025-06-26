const express = require('express');
const router = express.Router();
const Mood = require('../models/moodModel');
const moment = require('moment-timezone');

// GET all moods
router.get('/', async (req, res) => {
    try {
        const moods = await Mood.find({}).sort({ createdAt: -1 });
        res.status(200).json(moods);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

// GET mood by date (YYYY-MM-DD)
router.get('/by-date/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const mood = await Mood.findOne({ localDate: date });
        if (!mood) {
            return res.status(404).json({ message: 'No mood entry for this date' });
        }
        res.status(200).json(mood);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new mood
router.post('/', async (req, res) => {
    const { mood, localDate } = req.body;

    if (!mood || !localDate) {
        return res.status(400).json({ error: 'Mood and localDate are required' });
    }

    try {
        const newMood = await Mood.create({ mood, localDate });
        res.status(201).json(newMood);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
