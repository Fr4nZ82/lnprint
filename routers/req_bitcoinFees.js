var LNP = require('./utils')

module.exports = (req,res)=>{
  LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
  res.json(LNP.bitcoinFees)
}