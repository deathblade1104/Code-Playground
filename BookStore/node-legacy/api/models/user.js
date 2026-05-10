const mongoose = require('mongoose');
const constants = require('../config');

const userSchema = mongoose.Schema({
    name : { type : String , required : true},
    phone : {
        type : Number , 
        required : true
    },
    email : {
        type : String, 
        required: true,
        unique: true
    },
    status : {
        type : String ,
        enum: constants.user_status,
        default: constants.user_status_default},
        
    userType : {
        type: String,
        enum: constants.user_userType,
        default: constants.user_userType_default},

    password : {type : String, required: true},
},
{ timestamps: true }
);



module.exports = mongoose.model('User' , userSchema);