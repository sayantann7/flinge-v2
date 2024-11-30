const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption : {
        type : String,
        required: true
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    fanPage : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'FanPage',
        default : null
    },
    likes : {
        type : Number,
        default : 0
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);