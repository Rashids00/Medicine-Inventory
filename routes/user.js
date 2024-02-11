const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

let User = require('../models/user');

router.get('/signup', async (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            req.flash('error', 'Email already exists');
        } else {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg);
                req.flash('error', errorMessages.join(', '));
            } else if (req.body.password !== req.body.confirmPassword) {
                req.flash('error', 'Passwords do not match');
            } else {
                const user = new User({
                    email: req.body.email,
                    password: req.body.password,
                });

                await user.save();

                req.flash('success', 'Successfully signed up!');
            }
        }

        // Clear flash messages from session after rendering
        const successFlash = req.flash('success');
        const errorFlash = req.flash('error');
        res.render('signup', {
            success: successFlash.length > 0 ? successFlash : undefined,
            error: errorFlash.length > 0 ? errorFlash : undefined
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/login', async (req, res) => {
    res.render('login', { message: req.flash('error') });
});

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/user/login');
    });
});

router.post('/login', async function(req, res) {
    let query = { email: req.body.email, password: req.body.password };

    try {
        const user = await User.findOne(query);

        if (user) {
            req.session.email = user.email;
            res.redirect('/');
        } else {
            req.flash('error', 'Not found, Create an account before login');
            res.render('login', { message: req.flash('error') });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
