var mongoose = require('mongoose');

var UserS = new mongoose.Schema({
  _id: String,
  btcaddress: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  usedAddress: Array,
  session: Array,
  works: Array,
  messages: Array,
  shipments: {
    name: String,
    surname: String,
    street: String,
    citofono: Number,
    scala: String,
    citta: String,
    provincia: String,
    cap: String,
    tel: String,
    country: String
  },
  account: {
    balance: { type: Number, default: 0 },
    payreq: Array, // ONLY PENDING
    userRemotePubkeys: Array,
    history:[{
      fee_mtokens: Number,
      date: String,
      payreq: String,
      amt: Number,
      description: String,
      from: String,
      work: String
    }],
    ochistory:[{
      id: String,
      outgoing: Boolean,
      amt: Number,
      fee: Number,
      date: { type: Date, default: Date.now }
    }]
  },
  admin: {type: Boolean, default: false},
  email: String,
  date_modified: { type: Date, default: Date.now }
});

UserS.virtual('wallet').get(function () {
  return {pubkey: this._id, address: this.btcaddress};
});

//authenticate input against database
UserS.statics.authenticate = function (pubkey, address, callback) {
  User.findOne({ pubkey: pubkey })
  .exec(function (err, pbk) {
    if (err) {
      return callback(err)
    } else if (!pbk) {
      User.findOne({ address: address })
      .exec(function (err, adr) {
        if (err) {
          return callback(err)
        } else if (!adr) {
          var err = new Error('Pubkey or address not found.');
          err.status = 401;
          return callback(err);
        }
      });
    }
  });
  if(pubkey === User.pubkey){
    return callback(null, User);
  }else if(address === User.btcaddress){
    return callback(null, User);
  }else{
    return callback();
  }
}

var User = mongoose.model('User', UserS);
module.exports = User;
