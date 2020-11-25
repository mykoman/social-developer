const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true
    },

    avatar: {
        type: String
    },

    password: {
        type: String,
        required: true
    },

    name:{
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
    }
})

const User = mongoose.model('user', UserSchema);
module.exports = User;