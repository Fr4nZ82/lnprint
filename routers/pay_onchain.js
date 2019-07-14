var LNP = require('./utils')

module.exports = (req,res)=>{
  console.log('#!!-.POST/-'+req.body.type+'- richiesta: ',req.body)
  console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
  if(req.body.from && req.body.address && req.body.amt && req.body.fee && req.body.amt > 0){
    if(LNP.validateBtcAddress(req.body.address)){
      var from = req.body.from == 'donate' ? 'donation' : 'payment'
      LNP.ifUser(req,res,
        (actualUser)=>{
          if(actualUser.account.balance >= req.body.amt){
            LNP.lnClient.sendCoins(req.body.address, req.body.amt, req.body.fee, (err,txid)=>{
              if(err){
                console.log('#!!-.POST/-'+req.body.type+'- sendCoins error: ',err)
                if(err[2] && err[2].details === 'transaction output is dust'){
                  return res.json({message:{type:'alert',text:'amount is too low'}})
                }
                if(err[1] == 'ExpectedAddress'){
                  return res.json({message:{type:'alert',text:'need a valid address'}})
                }
              }
              LNP.updateOctx((err,octxInDb,poctxs)=>{
                if(!!err){
                  return res.json({message:{type:'alert',text:'server error, please refresh and wait while your tx is visible in you history'}})
                }
                var octxIds = octxInDb.map((x)=>{return x._id})
                var thisTxIndex = octxIds.indexOf(txid)
                if( thisTxIndex > -1){
                  var thisTx = octxInDb[thisTxIndex]
                  var dataForClient = {
                    id: thisTx._id,
                    outgoing: thisTx.is_outgoing,
                    amt: thisTx.tokens,
                    fee: thisTx.fee,
                    date: thisTx.created_at
                  }
                  var subtractToBalance = thisTx.tokens + thisTx.fee
                  //console.log('dataForClient: ',dataForClient)
                  LNP.MDB.collection('users').findOneAndUpdate(
                  {_id: req.session.user},
                  {$inc:{'account.balance': - subtractToBalance},
                    $push:{'account.ochistory':{
                      id: thisTx._id,
                      outgoing: thisTx.is_outgoing,
                      amt: thisTx.tokens,
                      fee: thisTx.fee,
                      date: thisTx.created_at }}},
                  {projection:{'account.userRemotePubkeys': 1,'_id':0}},
                  (err,uRP)=>{
                    if(err){
                      console.log('#!!-.POST/-'+req.body.type+'- error',err)
                      //if this database write fail, the server must be shutted down for security reason
                      let _datenow = new Date()
                      let recovery = {
                        date: _datenow.toISOString(),
                        user: req.session.user,
                        tx_id: thisTx._id,
                        amt: thisTx.tokens,
                        fee: thisTx.fee,
                        created_at: thisTx.created_at,
                        from: from
                      }
                      LNP.fs.appendFileSync('./dbFailureRecovery/failedOcWithdraws',JSON.stringify(recovery,null,2)+'\n')
                      return LNP.panic('OC WITHDRAW FAIL!','Something was wrong, a onchain payment was done but the account was not updated because server error. To avoid troubles server go offline until we solve the issue, sorry for the inconvenience')
                    }
                    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                    return res.json({message:{type:'notify',text:'on chain transaction sended!'}, txData: dataForClient})
                  })
                }
              })
            })
          }else{
            console.log('#!!-.POST/-'+req.body.type+'- not enough founds for this tx')
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({message:{type:'alert',text:'not enough founds for this tx'}})
          }
        },
        ()=>{
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({message:{type:'alert',text:'You are not logged in! Please refresh and retray'}})
        }
      )
    }
  }
}