const { Router } = require('express');
const router = Router();
const path = require('path');
const User = require('../database/Schemas/User');
const { hashPassword, comparePassword } = require('../utils/helper');

router.get('/register', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../clients/auth/register.html'));
});

router.post('/register', async (req, res) => {
    const { username, email, password} = req.body;

    if(!username ||!email ||!password) return res.status(400).json({err: 'Username, email or password is missing!'});

    const UserDb = await User.findOne({ username: username }) || await User.findOne({ email: email });

    if(UserDb) return res.status(400).json({err: 'User already exists!'});

    const hashedPassword = hashPassword(password);

    const newUser = await User.create({username: username, email: email, password: hashedPassword});

    res.status(200).json({redirect: true, redirectTo: '/auth/login'});

});

router.get('/login', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../clients/auth/login.html'));
});

router.post('/login', async (req, res) => {
    const { email, username, password } = req.body;

    if(!username ||!password) return res.status(400).json({err: 'Username or password is missing!'});

    const UserDb = await User.findOne({email: email }) ||await User.findOne({ username: username });

    if(!UserDb) return res.status(400).json({err: 'User does not exist!'});

    const isValid = comparePassword(password, UserDb.password);

    if(!isValid) return res.status(400).json({err: 'Invalid Password'});

    req.session.user = UserDb;

    return res.status(200).json({redirect: true, redirectTo: '/dashboard'});
});

module.exports = router;