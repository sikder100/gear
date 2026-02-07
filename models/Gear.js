const mongoose = require('mongoose');

const gearSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    status: { type: String, default: 'Available' },
    image: { type: String, required: true },
    owner: { type: String, required: true },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gear', gearSchema);