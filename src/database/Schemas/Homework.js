const mongoose = require('mongoose');

const HomeworkSchema = new mongoose.Schema({
    subject: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    done: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false,
    },
    user: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    descriptionIsPlain: {
        type: mongoose.SchemaTypes.Boolean,
        required: true
    }
});

module.exports = mongoose.model('homework', HomeworkSchema);
