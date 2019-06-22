var mongoose = require('mongoose');

var AddressS = new mongoose.Schema({
  _id: String,
  session: String,
  user: String,
  dateC: { type: Date, default: Date.now },
  amtReceived: Number,
  tx: Array,
  description: String,
  from: String,
  work: String,
});

var Address = mongoose.model('Address', AddressS);
module.exports = Address;
