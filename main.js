require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Database Connection
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Connected to MongoDB - GearShare Database'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

// 2. Middlewares
app.use(express.urlencoded({ extended: false })); // To handle form submissions
app.use(express.json()); // To handle JSON data
app.use(express.static('uploads')); // To make uploaded gear photos accessible

// 3. Session Configuration
app.use(session({
    secret: process.env.JWT_SECRET || 'gear_secret_key',
    saveUninitialized: true,
    resave: false
}));

// 4. Global Variables Middleware
// This makes "user" and "message" available in every EJS file automatically
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    res.locals.user = req.session.user || null;
    next();
});

// 5. Set Template Engine
app.set('view engine', 'ejs');

// 6. Route Management
// Note: We load Auth first so it takes priority
app.use("/auth", require('./routes/auth'));
app.use("/", require('./routes/gear'));

// 7. Start Server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});