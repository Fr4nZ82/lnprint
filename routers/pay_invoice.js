var LNP = require('./utils')

module.exports = (req,res)=>{
  console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
  LNP.ifUser(req,res,
    (actualUser)=>{
      LNP.lnClient.decodeInvoice(req.body.invoice, (err,decodedInvoice)=>{
        if(err){
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({message:{type:'alert',text: 'need valid BOLT11 invoice'}})
        }
        console.log('#!!-.POST/-'+req.body.type+'- Controllo se il saldo è sufficiente per pagaree l\'invoice')
        if(actualUser.account.balance >= decodedInvoice.tokens){
          if(decodedInvoice.tokens <= LNP.config.maxInvoiceAmt){
            var resultSended = false
            setTimeout(function () {
              if(!resultSended){
                resultSended = true
                LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                res.json({message:{type:'notify',text:'payment take time... wait the result'}})
              }
              else{
                LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                res.json({ok:'ok'})
              }
            }, 2000)
            LNP.lnClient.payInvoice(req.body.invoice,(err,result)=>{
              if(err){
                console.log('#!!-.POST/-'+req.body.type+'- payInvoice error: ',err)
                resultSended = true
                let dataForClient = {}
                if(err[2] == 'payment is in transition'){
                  dataForClient={message:{type:'alert',text:'error: payment is in transition, wait confirmation or timeout'}}
                }else{
                  dataForClient={message:{type:'alert',text:'error: payment error'}}
                }
                req.userSocketIds.forEach((sock)=>{
                  console.log('#!!-.POST/-'+req.body.type+'- socket:',sock)
                  console.log('#!!-.POST/-'+req.body.type+'- emit: ', 'withdraw_fail', err)
                  LNP.io.sockets.to(sock).emit('withdraw_fail', dataForClient)
                })
              }else{
                console.log('#!!-.POST/-'+req.body.type+'- invoice pagata')
                resultSended = true
                let dataForClient = {
                  fee_mtokens: result.fee_mtokens,
                  date: Date.parse(new Date()),
                  payreq: result.id,
                  amt: result.tokens,
                  description: 'toDo', // TODO
                  from: req.body.from,
                  work: req.body.work || 'withdraw'
                }
                req.userSocketIds.forEach((sock)=>{
                  console.log('#!!-.POST/-'+req.body.type+'- socket:',sock)
                  console.log('#!!-.POST/-'+req.body.type+'- emit: ', 'withdraw_done', dataForClient)
                  LNP.io.sockets.to(sock).emit('withdraw_done', dataForClient)
                })
                LNP.MDB.collection('users').findOneAndUpdate(
                {_id: req.session.user},{
                  $inc:{'account.balance': - result.tokens},
                  $push:{'account.history':{
                    'fee_mtokens': result.fee_mtokens,
                    'date': new Date(),
                    'payreq': result.id,
                    'amt': result.tokens,
                    'description': 'toDo', // TODO
                    'from': req.body.from,
                    'work': req.body.work || 'withdraw'}}},
                {projection:{'account.userRemotePubkeys': 1,'_id':0}},
                (err,uRP)=>{
                  if(err){
                    console.log('#!!-.POST/-'+req.body.type+'- error',err)
                    //if this database write fail, the server must be shutted down for security reason
                    let _datenow = new Date()
                    let recovery = {
                      date: _datenow.toISOString(),
                      user: req.session.user,
                      payreq: result.id,
                      amt: result.tokens,
                      from: req.body.from,
                      work: req.body.work || 'withdraw'
                    }
                    LNP.fs.appendFileSync('./dbFailureRecovery/failedWithdraws',JSON.stringify(recovery,null,2)+'\n')
                    return LNP.panic('WITHDRAW FAIL!','Something was wrong, a payment was done but the account was not updated because server error. To avoid troubles server go offline until we solve the issue, sorry for the inconvenience')
                  }
                  if(result.hops.length == 1){
                    console.log('#!!-.POST/-'+req.body.type+'- il destinatario del pagamento era il primo hop...')
                    let userRemotePubkeys = uRP.value.account.userRemotePubkeys || []
                    var chanMessage = userRemotePubkeys.length < 2 ? 'channels_disclosure' : 'channels_info'
                    let paymentChannel = result.hops[0].chan_id
                    console.log('#!!-.POST/-'+req.body.type+'- userRemotePubkeys',userRemotePubkeys)
                    console.log('#!!-.POST/-'+req.body.type+'- payment channel id',paymentChannel)
                    LNP.updateChannels((err,nodeChannelsList)=>{
                      if(!!err){
                        //TODO: can not respond with json another time! use socket instead
                        return res.json({message:{type:'alert',text:'server error, please try later'}})
                      }
                      nodeChannelsList.forEach((nodeChan)=>{ //PER OGNI CANALE
                        if(paymentChannel == nodeChan._id){  //SE è LO STESSO CANALE DI QUELLO USATO PER IL WITHDRAW
                          console.log('#!!-.POST/-'+req.body.type+'- payment channel trovato',nodeChan)
                          let userRemotePubkeysid = userRemotePubkeys.map((x)=>{return x._id})
                          if(userRemotePubkeys.length == 0 || !userRemotePubkeysid.includes(nodeChan.partner_public_key)){ //SE L'ARRAY DELLE PUBKEYS DELL'UTENTE è VUOTO O è UNA PUBKEY NON PRESENTE NELL'ARRAY
                            console.log('#!!-.POST/-'+req.body.type+'- nuvo nodo '+nodeChan.partner_public_key+' assegnato all\'utente '+req.session.user)
                            userRemotePubkeys.push({channels:[],_id:nodeChan.partner_public_key})
                          }
                          nodeChannelsList.forEach((nodeChan2)=>{
                            userRemotePubkeys.forEach((userRemotePubkey,index)=>{
                              let userRemotePubkeyChannlesid = userRemotePubkey.channels.map((x)=>{return x._id})
                              if(nodeChan2.partner_public_key == userRemotePubkey._id && !userRemotePubkeyChannlesid.includes(nodeChan2._id)){
                                userRemotePubkeys[index].channels.push({
                                  remote_balance:nodeChan2.remote_balance,
                                  local_balance:nodeChan2.local_balance,
                                  _id:nodeChan2._id
                                })
                              }
                            })
                          })
                        }
                      })
                      LNP.MDB.collection('users').updateOne(
                        {_id:req.session.user},
                        {
                          $set:{
                            'account.userRemotePubkeys': userRemotePubkeys,
                            docUpdatedAt: new Date()
                          }
                        },
                        (err)=>{
                          if(err){
                            console.log('#!!-.POST/-'+req.body.type+'- error',err)
                            res.sendStatus(503)
                          }else{
                            console.log('#!!-.POST/-'+req.body.type+'- Nodi e canali utente salvati nel db:',userRemotePubkeys)
                            req.userSocketIds.forEach((sock)=>{
                              LNP.io.sockets.to(sock).emit(chanMessage, userRemotePubkeys)
                            })
                          }
                        }
                      )
                    })
                  }
                })
                LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
              }
            })
          }else{
            console.log('#!!-.POST/-'+req.body.type+'- max invoice amt exceeded')
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({message:{type:'alert',text:'max invoice amt exceeded'}})
          }
        }else{
          console.log('#!!-.POST/-'+req.body.type+'- no founds to pay invoice')
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({message:{type:'alert',text:'no founds to pay invoice'}})
        }
      })
    },
    ()=>{
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json({message:{type:'alert',text:'You are not logged in! Please refresh and retray'}})
    }
  )
}