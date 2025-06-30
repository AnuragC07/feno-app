const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Mood', moodSchema);
