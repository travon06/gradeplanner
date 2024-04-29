const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    grades: {
        type: mongoose.SchemaTypes.String,
        required: true,
        default: '{}',
    },
    createdAt: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('users', UserSchema);