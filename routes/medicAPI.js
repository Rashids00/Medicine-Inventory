const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

let Medic = require('../models/medic');

const ITEMS_PER_PAGE = 3;

router.post('/add', async (req, res) => {
    try {
        const { name, price, stockDetails, description } = req.body;

        if (!name || !price || !stockDetails || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingMedicine = await Medic.findOne({ name });
        if (existingMedicine) {
            return res.status(400).json({ error: 'Medicine with the same name already exists' });
        }

        const newMedicine = new Medic({ name, price, stockDetails, description });
        await newMedicine.save();

        return res.status(201).json({ success: 'Medicine added successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/search', async (req, res) => {
    try {
        const searchItem = req.body.search;
        const foundItem = await Medic.findOne({ name: searchItem });

        if (foundItem) {
            res.json({ foundItem });
        } else {
            res.json({ error: 'No record found', searchItem });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/edit/:id', async (req, res) => {
    try {
        const medicId = req.params.id;

        await Medic.findByIdAndUpdate(medicId, { 
            name: req.body.name, 
            price: req.body.price, 
            stockDetails: req.body.stockDetails, 
            description: req.body.description 
        });
        res.json({ success: 'Successfully Updated' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const medicId = req.params.id;

        await Medic.findByIdAndDelete(medicId);
        res.json({ success: 'Successfully Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;