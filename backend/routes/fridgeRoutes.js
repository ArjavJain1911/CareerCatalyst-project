const express = require('express');
const router = express.Router();
const FridgeItem = require('../models/FridgeItem');

// @route   GET /api/fridge
// @desc    Get all fridge items
router.get('/', async (req, res) => {
    try {
        const items = await FridgeItem.find().sort({ expiryDate: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/fridge
// @desc    Add a new item to fridge
router.post('/', async (req, res) => {
    const { name, expiryDate } = req.body;

    if (!name || !expiryDate) {
        return res.status(400).json({ message: 'Please provide name and expiryDate' });
    }

    const newItem = new FridgeItem({
        name,
        expiryDate
    });

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/fridge/:id
// @desc    Delete a fridge item
router.delete('/:id', async (req, res) => {
    try {
        const item = await FridgeItem.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
