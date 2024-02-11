const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

let User = require('../models/user');

const jwtKey = 'Hulk';

router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        } else {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg);
                return res.status(400).json({ error: errorMessages.join(', ') });
            } else if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            } else {
                const user = new User({
                    email: req.body.email,
                    password: req.body.password,
                });
                await user.save();
                return res.status(201).json({ success: 'Successfully signed up!' });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/login', async (req, res) => {
    const query = { email: req.body.email, password: req.body.password };

    try {
        const user = await User.findOne(query);

        if (user) {
            const token = jwt.sign({ userId: user._id, email: user.email }, jwtKey);
            res.json({ success: 'Login successful', token });
        } else {
            res.status(401).json({ error: 'Not found, create an account before login' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ success: 'Logout successful' });
});

module.exports = router;
