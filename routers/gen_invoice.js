var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.body.from){
    if(req.body.amt < LNP.config.maxInvoiceAmt){
      LNP.lnClient.genInvoice(req.body, (err,payreq)=>{
        if(err){
          return res.json({message:{type:'alert',text:'error generating invoice, please try later'}})
        }
        console.log('INVOICE GENERATA:',payreq)
        if(payreq.from == 'balanceCard'){
          var from = 'deposit'
        }else if(payreq.from == 'donate'){
          var from = 'donation'
        }else if(payreq.from == 'payment'){
          var from = 'payment'
        }
        let invoiceData = { 
          _id: payreq.id,
          payment_secret:payreq.payment_secret,
          dateC: payreq.created_at,
          dateE: payreq.dateE,
          invoice: payreq.invoice,
          amt: payreq.tokens,
          fba: payreq.chain_address,
          description: payreq.description,
          from: from,
          work: payreq.work,
          confirmed: false,
          confirmed_at: '',
          is_outgoing: false,
          docUpdatedAt: new Date()
        }
        function insertInvoice(invData){
          LNP.MDB.collection('invoices').insertOne(invData, (e, invoice)=>{
            if(e){return console.log('#!!-.POST/-'+req.body.type+'- error!',e)}
            console.log('#!!-.POST/-'+req.body.type+'- invoice saved on invoices collection')
            delete invData.fba
            delete invData.payment_secret
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json(invData)
          })
        }
        LNP.ifUser(req,res,
          (actualUser)=>{
            LNP.MDB.collection('users').updateOne(
              { _id: req.session.user },
              { 
                $set: { docUpdatedAt: new Date() },
                $addToSet: { 'account.payreq': invoiceData._id }
              },
              (err)=>{
                if(err){return console.log('#!!-.POST/-'+req.body.type+'- error!',err)}
                console.log('#!!-.POST/-'+req.body.type+'- invoice id saved on users collection')
                invoiceData.user = actualUser._id
                invoiceData.session = req.session.id
                insertInvoice(invoiceData)
              }
            )
          },
          ()=>{
            invoiceData.user = 'no'
            invoiceData.session = req.session.id
            insertInvoice(invoiceData)
          }
        )
      })
    }else{
      console.log('#!!-.POST/-'+req.body.type+'- max invoice amt exceeded')
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      return res.json({message:{type:'alert',text:'max invoice amt exceeded'}})
    }
  }
}