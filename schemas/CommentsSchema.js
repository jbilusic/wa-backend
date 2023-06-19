const mongoose = require('mongoose');

const CommentsSchema = new mongoose.Schema({
        username: {
            type: mongoose.SchemaTypes.String,
            required: true
          },
          content: {
            type: mongoose.SchemaTypes.String,
            required: true
          },
          timestamp: {
            type: Date,
            default: Date.now,
            required: true
          },
          likes: [
            {
              user: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'User',
                required: true,
              },
            },
          ],
          dislikes: [
            {
              user: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'User',
                required: true,
              },
            },
          ],
    
});

module.exports = mongoose.model('Comment', CommentsSchema);