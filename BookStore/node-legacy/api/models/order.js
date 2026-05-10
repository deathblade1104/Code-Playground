const mongoose = require('mongoose');
const constants = require('../config');

const orderSchema = mongoose.Schema({
    user_id : { type : mongoose.Types.ObjectId, ref : 'User'},
    total : { type : Number, default : constants.order_total_default },
    books : [{
        bookId: { type : mongoose.Types.ObjectId, ref : 'Book'},
        quantity: Number
    }],
    address  : {type : String , required : true},
    payment :{
        type : String ,
        enum: constants.order_payment,
        default: constants.order_payment_default
    },
    status : {
        type : String ,
        enum: constants.order_status,
        default: constants.order_status_default
    }},
    { timestamps: true }
);


module.exports = mongoose.model('Order' , orderSchema);