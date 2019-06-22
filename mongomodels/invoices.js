var mongoose = require('mongoose');

var InvoiceS = new mongoose.Schema({
  _id: String,
  session: String,
  user: String,
  payment_secret: String,
  invoice: String,
  dateC: { type: Date, default: Date.now },
  dateE: Date,
  amt: Number,
  fba: String,
  description: String,
  from: String,
  work: String,
  confirmed: Boolean,
  confirmed_at: Date,
  is_outgoing: Boolean
});

var Invoice = mongoose.model('Invoice', InvoiceS);
module.exports = Invoice;
