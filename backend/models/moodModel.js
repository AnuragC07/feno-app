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
}, {
    timestamps: true,
});

module.exports = mongoose.model('Mood', moodSchema);
