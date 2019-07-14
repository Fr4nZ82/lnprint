var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.body.invoice){
    let invoice = req.body.invoice
    let prefix = req.body.invoice.substr(0,10)
    if(prefix == "lightning:"){
      invoice = req.body.invoice.substr(10)
    }
    LNP.ifUser(req,res,
      (actualUser)=>{
        LNP.lnClient.decodeInvoice(invoice, (err,decodedInvoice)=>{
          if(err){
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({message:{type:'alert',text: 'need valid BOLT11 invoice'}})
          }
          let di = {
            invoice: invoice,
            expires_at: decodedInvoice.expires_at,
            sats: decodedInvoice.tokens
          }
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json(di)
        })
      },
      ()=>{
        console.log('#!!-.POST/-'+req.body.type+'- only logged users can decode invoice')
        return res.json({message:{type:'alert',text:'8=======D'}})
      }
    )
  }else{
    res.json({message:{type:'alert',text:'no invoice data to decode!'}})
  }
}