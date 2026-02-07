const express = require('express');
const router = express.Router();
const Gear = require('../models/Gear'); // Ensure this matches your model filename
const multer = require('multer');

// Image Upload Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage: storage });

// Marketplace Route (Search Requirement)
router.get('/', async (req, res) => {
    try {
        const query = req.query.q || "";
        const gear = await Gear.find({ itemName: { $regex: query, $options: 'i' } });
        res.render('index', { title: 'GearShare Marketplace', gear });
    } catch (err) {
        res.status(500).send("Error loading marketplace");
    }
});

// Add Gear Route
router.get('/add', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('add_gear', { title: 'List Your Gear' });
});

router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const newItem = new Gear({
            itemName: req.body.itemName,
            pricePerDay: req.body.pricePerDay,
            status: req.body.status,
            image: req.file.filename,
            owner: req.session.user.name
        });
        await newItem.save();
        res.redirect('/');
    } catch (err) {
        res.redirect('/add');
    }
});

router.post('/update-status/:id', async (req, res) => {
    // 1. Check if user is logged in
    if (!req.session.user) {
        // Optional: Save a message to tell them why they are being redirected
        req.session.message = { 
            type: 'warning', 
            message: 'Please login to rent gear!' 
        };
        return res.redirect('/auth/login');
    }

    try {
        const item = await Gear.findById(req.params.id);
        
        if (!item) return res.status(404).send("Item not found");

        // 2. Toggle status
        item.status = (item.status === 'Available') ? 'Rented' : 'Available';
        await item.save();
        
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
});

// DELETE PRODUCT (Admin Only)
router.get('/delete/:id', async (req, res) => {
    // Ensure user is logged in AND is an admin
    if (req.session.user && req.session.user.role === 'admin') {
        await Gear.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } else {
        // If not admin, deny access
        res.status(403).send("Access Denied: You do not have permission to delete gear.");
    }
});

module.exports = router;