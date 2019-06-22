var mongoose = require('mongoose');

var PresetS = new mongoose.Schema({
  _id: String,
  name: { //calendario A3 | orecchini belli
    type: String,
    unique: true,
    required: true
  },
  fields:Array,
  date_modified: { type: Date, default: Date.now }
});

var Preset = mongoose.model('Preset', PresetS);
module.exports = Preset;
