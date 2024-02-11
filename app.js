const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

mongoose.connect("mongodb+srv://rashi00:Rashi4701@cluster0.kbyy0gn.mongodb.net/?retryWrites=true&w=majority");
let db = mongoose.connection;

db.on('error', function (err) {
    console.log(err);
});

db.once('open', function () {
    console.log("Connected to mongodb");
});

const app = express();

const jwtKey = 'Hulk';

app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const mongoStore = MongoStore.create({ 
    mongoUrl: 'mongodb+srv://rashi00:Rashi4701@cluster0.kbyy0gn.mongodb.net/?retryWrites=true&w=majority', 
    mongooseConnection: mongoose.connection 
});

app.use(session({
    secret: 'Hulk',
    resave: false, 
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
    }
}));

app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

function isAuthenticated(req, res, next) {
    if (req.session.email) {
        return next();
    } else {
        res.redirect('/user/login');
    }
};

function isAuthorized(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    try {
        const decoded = jwt.verify(token, jwtKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
}

let Medic = require('./routes/medic');
let User = require('./routes/user');

app.use('/medic', isAuthenticated, Medic);
app.use('/user', User);

var medAPI = require('./routes/medicAPI');
app.use('/medicapi', isAuthorized, medAPI);

var userAPI = require('./routes/userAPI');
app.use('/userapi', userAPI);

app.get('/', (req, res) => {
    if (req.session.email) {
        res.redirect('/medic');
    } else {
        res.redirect('/user/login');
    }
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server started on port ${port}...`);
});