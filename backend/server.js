const express = require("express");
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const taskRoutes = require('./api/taskApi');
const journalRoutes = require('./api/journalApi');
const moodRoutes = require('./api/moodApi');

dotenv.config();


const app = express();

// More permissive CORS settings for development
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());


// Test endpoint
app.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Server is reachable' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/moods', moodRoutes);


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server is accessible at:`);
    console.log(`- Local: http://localhost:${PORT}`);
}); 