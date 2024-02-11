var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');

let Medic = require('../models/medic');

const ITEMS_PER_PAGE = 5;

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const totalItems = await Medic.countDocuments();
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const medicine = await Medic.find().skip(skip).limit(ITEMS_PER_PAGE);

        const startingNumber = (page - 1) * ITEMS_PER_PAGE + 1;

        res.render('index', { medicine, activePage: 'home', currentPage: page, totalPages, startingNumber, flash: req.flash() });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

router.get('/add', (req, res) => {
    const flashMessage = req.flash('error');
    if (flashMessage.length > 0) {
        res.render('add', { flashMessage: flashMessage });
    } else {
        res.render('add');
    }
});

router.get('/edit/:id', function (req, res) {
    Medic.findById(req.params.id)
        .then((medic) => {
            const flashMessage = req.flash('error');
            if (flashMessage.length > 0) {
                res.render('edit', {
                    medic: medic,
                    flashMessage: flashMessage
                });
            } else {
                res.render('edit', {medic: medic})
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

router.get('/view/:id', async (req, res) => {
    const medicId = req.params.id;
    try {
        const medic = await Medic.findById(medicId);

        res.render('view', { medic: medic });
    } catch (error) {
        console.error('Error retrieving medicine:', error);
        res.status(500).send('Error retrieving medicine');
    }
});

router.get('/about', async (req, res) => {
    res.render('about', { activePage: 'about' });
});

router.get('/contact',  async (req, res) => {
    res.render('contact', { activePage: 'contact' });
});

router.post('/add', async (req, res) => {
    try {
        const { name, price, stockDetails, description } = req.body;

        if (isNaN(price)) {
            req.flash('error', 'Price must be a number');
            return res.redirect('/medic/add');
        }

        if (!name || !price || !stockDetails || !description) {
            req.flash('error', 'All fields are required');
            return res.redirect('/medic/add');
        }

        const existingMedicine = await Medic.findOne({ name });
        if (existingMedicine) {
            req.flash('error', 'Medicine with the same name already exists');
            return res.redirect('/medic/add');
        }

        const newMedicine = new Medic({ name, price, stockDetails, description });
        await newMedicine.save();

        req.flash('success', 'Medicine added successfully');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Internal Server Error');
        res.redirect('/medic/add');
    }
});

router.post('/search', async (req, res) => {
    try {
        const searchItem = req.body.search;

        if (!searchItem || searchItem.trim() === '') {
            req.flash('error', 'Please enter a medicine to search.');
            return res.redirect('/');
        }

        const foundItem = await Medic.findOne({ name: searchItem });

        if (foundItem) {
            const allMedicines = await Medic.find();
            const siNo = allMedicines.findIndex(item => item._id.toString() === foundItem._id.toString()) + 1;
            res.render('recordFound', { foundItem, siNo });
        } else {
            res.render('noRecord', { searchItem });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/edit/:id', async (req, res) => {
    try {
        const { name, price, stockDetails, description } = req.body;

        if (!name || !price || !stockDetails || !description) {
            req.flash('error', 'All fields are required');
            return res.redirect(`/medic/edit/${req.params.id}`);
        }

        if (isNaN(price)) {
            req.flash('error', 'Price must be a number');
            return res.redirect(`/medic/edit/${req.params.id}`);
        }

        const existingMedicine = await Medic.findOne({ name });
        if (existingMedicine && existingMedicine._id != req.params.id) {
            req.flash('error', 'Medicine with the same name already exists');
            return res.redirect(`/medic/edit/${req.params.id}`);
        }

        let medicId = { _id: req.params.id };

        await Medic.updateOne(medicId, { 
            name: req.body.name, 
            price: req.body.price, 
            stockDetails: req.body.stockDetails, 
            description: req.body.description
        });

        req.flash('success', 'Successfully Updated');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/medic/edit/${req.params.id}`);
    }
});


router.delete('/delete/:id',  async (req, res) => {

    let medicId = { _id: req.params.id };

    Medic.deleteOne(medicId)
        .then(() => {
            req.flash('success', 'Successfully Deleted');
            res.send('Success');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

module.exports = router;