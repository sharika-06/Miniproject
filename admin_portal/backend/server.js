const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admins', require('./routes/admins'));

// Placeholder route
app.get('/', (req, res) => {
    res.send('Admin Portal Backend works!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
