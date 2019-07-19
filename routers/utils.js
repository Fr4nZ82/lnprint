var LNP = require('../app')
LNP.pauselog = (req,intestation,mc)=>{ 
  mc = mc || 'no'
  if(mc == 'mc'){
    console.log(intestation + " remote ip: " + LNP.clc.red.bgWhiteBright(req.connection.remoteAddress))
    console.log(intestation + " useragent: " + req.headers['user-agent'])
    return
  }
  let _DATENOW = new Date()
  let txt = _DATENOW + LNP.clc.whiteBright.bold.underline("\nWAITING...\n")
  // console.log(intestation + " remote ip: " + LNP.clc.red.bgWhiteBright(req.connection.remoteAddress))
  // console.log(intestation + " useragent: " + req.headers['user-agent'])
  console.log(intestation + " session_id: " + req.session.id)
  if(req.session.user){
    console.log(intestation + " user_id: " + req.session.user)
    var userSockets = []
    LNP.allSockets.forEach((sock)=>{
      if(sock.user == req.session.user){
        userSockets.push(sock._id)
      }
    })
    console.log(intestation + " sockets dell'utente: " + userSockets)
  }else{
    console.log(intestation + " utente non loggato")
  }
  console.log(intestation + " Session req n. " + req.session.data.reqs)
  console.log(intestation + txt)
  console.log(" ")
}
LNP.newUser = (pubkey,address,sessionId,isAdmin)=>{
  isAdmin = isAdmin || false
  var user = {
    _id: pubkey,
    btcaddress: address,
    session: [sessionId],
    account: {
      balance: 0,
      payreq: [], // ONLY PENDING
      userRemotePubkeys: [],
      history:[],
      ochistory:[]
    },
    registeredAt: new Date()
  }
  if(isAdmin){
    user.admin = true
  }
  return user
}
LNP.validatePrivkey = (key)=>{
  key = key.toString()
  return (/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(key))
}
LNP.validateWallet = (wallet)=>{
  //console.log('#!!-validate- provo a validare pubkey e btcaddress...')
  var pk = wallet._id.toString()
  var ad = wallet.btcaddress.toString()
  console.log('#!!-validate- ',ad)
  if(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(ad)){
    console.log('#!!-validate- btcaddress valido:')
    if(/(^02|^03)[A-Fa-f0-9]{64}$/.test(pk)){
      console.log('#!!-validate- pubkey valida:')
      return true
    }else{
      console.log('#!!-validate- pubkey NON valida:')
      return false
    }
  }else{
    console.log('#!!-validate- btcaddress NON valido:')
    return false
  }
}
LNP.validateBtcAddress = (addr)=>{
  addr = addr.toString()
  return (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr))
}
LNP.ifUser = (req,res,ifExist,ifNotExist,ifErr)=>{
  ifErr = ifErr || 'no'
  if(req.session.user){
    console.log('#!!-.POST/-'+req.body.type+'- cerco nel db i dati utente:')
    LNP.MDB.collection('users').findOne({_id:req.session.user}).then(actualUser => {
      if(actualUser && actualUser._id && actualUser._id != ""){ //KEY ESISTENTE
        console.log('#!!-.POST/-'+req.body.type+'- ho trovato un utente con lo stesso id!')
        //console.log('actualUser',actualUser)
        if(actualUser._id == LNP.config.rootPubKey){
          if(actualUser.admin !== true){
            actualUser.admin = true
            LNP.MDB.collection('users').updateOne({_id:actualUser._id},{$set:{'admin': true}},(err)=>{
              if(err){
                let nm = {message:{type:'alert',text: 'server error, try later'}}
                console.log('#!!-.POST/-'+req.body.type+'- errore mongoDB:',error)
                console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:',nm)
                LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json(nm)
              }
            })
          }
        }
        ifExist(actualUser)
      }else{
        console.log('#!!-.POST/-'+req.body.type+'- non ho trovato nessun utente con lo stesso id!')
        if(ifErr != 'no'){
          ifErr()
        }else{
          delete req.session
          let nm = {message:{type:'alert',text: 'user not found in the db'}}
          console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:',nm)
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json(nm)
        }
      }
    }).catch(error => {
      if(ifErr != 'no'){
        ifErr(error)
      }else{
        let nm = {message:{type:'alert',text: 'server error, try later'}}
        console.log('#!!-.POST/-'+req.body.type+'- errore mongoDB:',error)
        console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:',nm)
        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
        return res.json(nm)
      }
    })
  }else{
    ifNotExist()
  }
}

module.exports = LNP