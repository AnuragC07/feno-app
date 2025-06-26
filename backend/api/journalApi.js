const express = require('express');
const router = express.Router();
const Journal = require('../models/journalModel');

// GET all journal entries
router.get('/', async (req, res) => {
    try {
        const journals = await Journal.find({}).sort({ createdAt: -1 });
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a single journal entry
router.get('/:id', async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new journal entry
router.post('/', async (req, res) => {
    const { content, mood, localDate } = req.body;

    try {
        const journal = await Journal.create({ content, mood, localDate });
        res.status(201).json(journal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a journal entry
router.delete('/:id', async (req, res) => {
    try {
        const journal = await Journal.findByIdAndDelete(req.params.id);
        if (!journal) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }
        res.status(200).json({ message: 'Journal entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a journal entry
router.put('/:id', async (req, res) => {
    try {
        const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!journal) {
            return res.status(404).json({ message: 'Journal entry not found' });
        }
        res.status(200).json(journal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET journal by date (YYYY-MM-DD)
router.get('/by-date/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const journal = await Journal.findOne({ localDate: date });
        if (!journal) {
            return res.status(404).json({ message: 'No journal entry for this date' });
        }
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
