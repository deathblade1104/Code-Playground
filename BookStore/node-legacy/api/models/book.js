const constants = require('../config');
const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title : {type : String , required : true},
    author :{type : String , required : true},
    image : {type : String , required : true},
    status : {
        type : String ,
        enum: constants.book_status,
        default: constants.book_status_default
    },
    price : {type : Number , required : true},
    stock : {type : Number , required : true},
},
{ timestamps: true }
);


module.exports = mongoose.model('Book' , bookSchema);