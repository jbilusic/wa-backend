const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    author: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    title: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    img: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    postDate: {
        type : Date,
        default: Date.now,
        required: true
    },
    content: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    views: {
        type: Number,
        required: true
    },
    comments: [
      {
        
      }
    ]
});

module.exports = mongoose.model('Article', ArticleSchema);