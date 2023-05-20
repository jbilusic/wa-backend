const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    ArticleId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Like', LikeSchema);