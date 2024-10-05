const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: false  // Optional for Google Oauth
        },
        authMethod: {
            type:String,
            enum: ['local', 'google'],
            required: true
        },
        userReels: {
            type: Array,
            default: []
        },
    }, 
    {timestamps: true}
)

const User = mongoose.model("User", userSchema)
module.exports = User;