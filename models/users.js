require('dotenv').config();
const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bio : {
        type : String,
        default : ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"]
    },
    profilePic : {
        type : String,
        default : ''
    },
    password : {
        type : String
    },
    fanPages : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'FanPage'
            }
        ],
        default : []
    },
    likedPosts : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Post'
            }
        ],
        default : []
    },
    userPosts : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Post'
            }
        ],
        default : []
    },
    about : {
        genres : {
            type : String,
            default : ''
        },
        directors : {
            type : String,
            default : ''
        }
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);