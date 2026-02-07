const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GET Login Page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// GET Register Page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// POST Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });
        
        await user.save();
        req.session.message = { type: 'success', message: 'Account created! Please login.' };
        res.redirect('/auth/login');
    } catch (err) {
        req.session.message = { type: 'danger', message: 'Email already exists.' };
        res.redirect('/auth/register');
    }
});

// POST Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            // Requirement #6: Generate JWT
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            req.session.user = user;
            req.session.token = token;
            res.redirect('/');
        } else {
            req.session.message = { type: 'danger', message: 'Invalid credentials' };
            res.redirect('/auth/login');
        }
    } catch (err) {
        res.redirect('/auth/login');
    }
});

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;