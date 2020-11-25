const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
    user: {
        ref: "user",
        type: mongoose.Schema.Types.ObjectId
    },

    company: {
        type: String
    },

    website: {
        type: String
    },
    
    location: {
        type: String
    },

    status: {
        type: String
    },

    skills: {
        type: [String]
    },

    bio: {
        type: String
    },

    githubUsername : {
        type: String
    },

    experience : [{
        title: {
            type: String,
            required: true
        },
        
        location: {
            type: String,
        },

        from: {
            type: Date,
            required: true
        },
        
        to: {
            type: Date,
        },
        
        description: {
            type: String,
        },
        
        current: {
            type: Boolean,
        },
        
        company: {
            type: String,
            required: true
        },
        
    }],

    education: [{
        school: {
            required: true,
            type: String
        },

        qualification: {
            type: String,
            required: true
        },
        
        fieldOfStudy: {
            type: String,
            required: true,
        },

        from: {
            type: Date,
            required: true
        },
        
        to: {
            type: Date,
        },
        
        description: {
            type: String,
        },
        
        current: {
            type: Boolean,
            default:false
        }
        
    }],

    social : {
        youtube : {
            type: String,
        },
        twitter: {
            type: String
          },
          facebook: {
            type: String
          },
          linkedin: {
            type: String
          },
          instagram: {
            type: String
          }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }, 

    updatedAt: {
        type: Date,
    }

})

const profile = mongoose.model('profile', profileSchema)
module.exports = profile;