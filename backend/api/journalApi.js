const express = require('express');
const router = express.Router();
const Journal = require('../models/journalModel');

// GET all journals for a specific user
router.get("/", async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: "userId query param is required" });
        }
        const journals = await Journal.find({ userId: req.query.userId }).sort({ createdAt: -1 });
        res.json(journals);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    const { content, mood, localDate, userId } = req.body;

    try {
        const journal = await Journal.create({ content, mood, localDate, userId });
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

// GET all dates with journal entries for a user
router.get("/dates", async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: "userId query param is required" });
        }
        const dates = await Journal.distinct("localDate", {
            userId: req.query.userId,
        });
        res.json(dates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a journal entry by date for a user
router.get("/by-date/:date", async (req, res) => {
    try {
        if (!req.query.userId) {
            return res.status(400).json({ message: "userId query param is required" });
        }
        const journal = await Journal.findOne({
            localDate: req.params.date,
            userId: req.query.userId,
        });
        if (journal == null) {
            return res
                .status(404)
                .json({ message: "Cannot find journal entry for this date" });
        }
        res.json(journal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function getJournal(req, res, next) {
    let journal;
    try {
        journal = await Journal.findById(req.params.id);
        if (journal == null) {
            return res.status(404).json({ message: "Cannot find journal entry" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.journal = journal;
    next();
}

module.exports = router;
