var mongoose = require('mongoose');

var WorksS = new mongoose.Schema({
  pId: {
    type: String,
    unique: false,
    required: true
  },
  estimatedTime:Number,
  status: String,
  messages: Array,
  copies: Number,
  date_modified: { type: Date, default: Date.now }
});

var Work = mongoose.model('Work', WorksS);
module.exports = Work;
