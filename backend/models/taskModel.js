const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    done: {
        type: Boolean,
        default: false,
    },
    localDate: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
