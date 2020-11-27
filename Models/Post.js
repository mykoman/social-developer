const mongoose = require('mongoose')
const MySchema = mongoose.Schema

const PostSchema = new MySchema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },

    name : {
        type: String,
        required: true
    },

    avatar : {
        type: String,
    },

    text: {
        type: String,
        required
    },

    comment: [{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        name : {
            type: String,
            required: true
        },
    
        avatar : {
            type: String,
        },

        text:{
            type: String,
            required: true,
        },

        date: {
            type: Date,
            default: Date.now
        }
        
    }],

    like : [{
        user: {
            type: MySchema.Types.ObjectId,
            ref: 'user'
        }

    }],
    date: {
        type: Date,
        default:Date.now
    }

})
const postModel = mongoose.model('post', PostSchema);
module.exports = postModel