const express = require('express');
const app = express();
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

require('./database/index');

const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    session({
        secret: 'JLBLHBWERLHBLHXBDJSJBDFL',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: 'mongodb://localhost:27017/gradeplanner',
        }),
    })
);

app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`); 
    next();
});

app.use('/auth', authRoute);

app.use((req, res, next) => {
    if(!req.session.user) return res.status(400).redirect('/auth/login');
    next();
});

app.use('/dashboard', dashboardRoute);

app.listen(PORT, () => console.log(`Listening on Port ${PORT}...`));