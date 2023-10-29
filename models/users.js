
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type : String,
        required : true,
    },
    password : {
        type : String,
        required :true,
    },
    created:{
        type : Date,
        required : true,
        default : Date.now
    }
});

module.exports = mongoose.model('users', userSchema);