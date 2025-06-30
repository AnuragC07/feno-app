const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    mood: {
        type: String,
        required: true,
    },
    localDate: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Journal', journalSchema);
