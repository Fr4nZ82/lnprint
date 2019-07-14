var LNP = require('./utils')

module.exports = (req,res)=>{
  console.log('#!!-.POST/-'+req.body.type+'- richiesta: ',req.body)
  if(req.body.from){
    LNP.lnClient.newAddress((err,newBtcAddr)=>{
      if(err){
        return res.json({message:{type:'alert',text:'error generating address, please try later'}})
      }
      if(req.body.from == 'balanceCard'){
        var from = 'deposit'
      }else if(req.body.from == 'donate'){
        var from = 'donation'
      }else if(req.body.from == 'payment'){
        var from = 'payment'
      }else{
        console.log('#!!-.POST/-'+req.body.type+'- from inaspettato')
        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
        return res.json({message:{type:'alert',text:'no valid from'}})
      }
      addressData = {
        _id: newBtcAddr.address,
        description: newBtcAddr.description,
        dateC: new Date(),
        from: from,
        work: newBtcAddr.work,
        amtReceived: 0,
        session: req.session.id,
        tx: [],
        user: ''
      }
      var insertAddress = (aD)=>{
        LNP.MDB.collection('addresses').insertOne(aD, (e, addr)=>{
          if(e){
            console.log('#!!-.POST/-'+req.body.type+'- error!',e)
            return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
          }
          console.log('#!!-.POST/-'+req.body.type+'- indirizzo salvato nella collection indirizzi')
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json(aD)
        })
      }
      LNP.ifUser(req,res,
        (actualUser)=>{
          LNP.MDB.collection('users').updateMany({ _id: req.session.user }, { $addToSet: { 'usedAddress': addressData._id }}, (err)=>{
            if(err){
              console.log('#!!-.POST/-'+req.body.type+'- error!',err)
              return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
            }
            console.log('#!!-.POST/-'+req.body.type+'- indirizzo salvato nella collection users')
            addressData.user = actualUser._id
            insertAddress(addressData)
          })
        },
        ()=>{
          addressData.user = 'noUser'
          insertAddress(addressData)
        }
      )
    })
  }
}