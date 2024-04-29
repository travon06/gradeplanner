const mongoose = require('mongoose');

mongoose
    .connect('mongodb://localhost:27017/gradeplanner')
    .then(console.log('Connceted to db'))
    .catch((err) => console.log(err)); 
