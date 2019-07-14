var LNP = require('./utils')

module.exports = (req,res)=>{
  console.log('#!!-.POST/-'+req.body.type+'- richiesta: ',req.body)
  console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
  if(req.body.from){
    if(req.body.from == 'donate'){
      var from = 'donation'
    }else{
      var from = 'payment'
    }
    LNP.ifUser(req,res,
      (actualUser)=>{
        console.log('#!!-.POST/-'+req.body.type+'- Controllo se il saldo è sufficiente per il pagamento')
        if(actualUser.account.balance >= req.body.amt){
          LNP.MDB.collection('users').findOneAndUpdate(
          {_id: req.session.user},{
            $inc:{'account.balance': - req.body.amt},
            $push:{'account.history':{
              'fee_mtokens': 999999999999,
              'date': new Date(),
              'payreq': 'paymentFromAccount',
              'amt': req.body.amt,
              'description': 'toDo', // TODO
              'from': from,
              'work': req.body.work || 'no_work'}}},
          (err,uB)=>{
            if(err){
              console.log('#!!-.POST/-'+req.body.type+'- error',err)
              return res.json({message:{type:'alert',text:'server error, please refresh and retry'}})
            }
            let uAccount = actualUser.account
            uAccount.balance = uAccount.balance - req.body.amt
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({account:uAccount,message:{type:'notify',text:'payment done!'}})
          })
        }else{
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({message:{type:'alert',text:'no founds to pay invoice'}})
        }
      },
      ()=>{
        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
        return res.json({message:{type:'alert',text:'You are not logged in! Please refresh and retray'}})
      }
    )
  }
}