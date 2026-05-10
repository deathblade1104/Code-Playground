const mongoose = require('mongoose');
const constants = require('../config');

const shoppingBagSchema = mongoose.Schema({
    user_id : { type : mongoose.Types.ObjectId, ref : 'User'},
    total : { type : Number, default : constants.shoppingBag_total_default },
    books : [
        {
        bookId: { type : mongoose.Types.ObjectId, ref : 'Book'},
        quantity: Number,
    }],
    status : {
        type : String ,
        enum: constants.shoppingBag_status,
        default: constants.shoppingBag_status_default
    }   
},
{ timestamps: true }
);


module.exports = mongoose.model('ShoppingBag' , shoppingBagSchema);