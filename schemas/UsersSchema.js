const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        lowercase:true
    },
    email: {
        type: mongoose.SchemaTypes.String,
        required: true,
        lowercase:true
    },
    password: {
        type: mongoose.SchemaTypes.String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);