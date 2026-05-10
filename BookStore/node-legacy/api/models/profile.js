const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
  orders: [{type: mongoose.Types.ObjectId, ref: 'Order'}],
  addresses: [{type: String}]
});

module.exports = mongoose.model('Profile', profileSchema);