var LNP = require('./utils')

module.exports = (req,res)=>{
  LNP.ifUser(req,res,
    (actualUser)=>{
      console.log('#!!-.POST/-'+req.body.type+'- User already registered and logged:',actualUser)
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      return res.json({message:{type: 'alert', text: 'You are already registered and logged! Pls refresh'}})
    },
    ()=>{
      console.log('#!!-.POST/-'+req.body.type+'- controllo se privkey esiste nei dati arrivati dal client')
      if( req.body.privkey ) {
        console.log('#!!-.POST/-'+req.body.type+'- esiste, quindi controllo che sia nel formato wif...')
        if(LNP.validatePrivkey(req.body.privkey)){
          console.log('#!!-.POST/-'+req.body.type+'- OK derivo chiave pubblica e indirizzo btc')
          try{
            let keyPair = LNP.bitcoin.ECPair.fromWIF(req.body.privkey)
            let { address } = LNP.bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
            let pubkey = keyPair.publicKey.toString('hex')
            req.body.privkey = ''
            keyPair = ''
            delete req.body.privkey
            delete keyPair
            var dateNew = new Date()
            var updatesOnLogin = {
              lastLogin: dateNew,
              docUpdatedAt: dateNew
            }
            console.log('#!!-.POST/-'+req.body.type+'- cerco nel db tra le chiavi pubbliche degli utenti se ne trovo una uguale:')
            LNP.MDB.collection('users').findOne({ _id: pubkey }).then(dbUser => {
              if(dbUser){ //KEY EXIST
                console.log('#!!-.POST/-'+req.body.type+'- ne ho trovata una uguale!:',dbUser)
                console.log('#!!-.POST/-'+req.body.type+"- assegno l'id utente alla sessione in corso.")
                req.session.user = dbUser._id
                console.log('#!!-.POST/-'+req.body.type+"- se è un admin la sessione prende il valore admin")
                if(dbUser._id == LNP.config.rootPubKey){
                  if(dbUser.admin !== true){
                    updatesOnLogin.admin = true
                  }
                  dbUser.admin = true
                }
                LNP.MDB.collection('users').updateOne({ _id: dbUser._id },{ $set: updatesOnLogin }).then(()=>{
                  if(dbUser.admin === true){
                    req.session.admin = true
                  }else{
                    req.session.admin = false
                    delete req.session.admin
                  }
                  console.log('#!!-.POST/-'+req.body.type+'- controllo se utente aveva delle vecchie sessioni...')
  
                  if(dbUser.session.length > 0){
                    console.log('#!!-.POST/-'+req.body.type+'- aveva delle sessioni:',dbUser.session)
                    console.log('#!!-.POST/-'+req.body.type+'- ognuna la cerco nella collezione sessions:',dbUser.session)
                    let sessionsArray = []
                    LNP.MDB.collection('sessions').find({_id: {$in: dbUser.session}}).forEach(function(dbSess) {
                      console.log('#!!-.POST/-'+req.body.type+'- trovata, la aggiungo all\'array sessionsArray:',dbSess)
                      sessionsArray.push(dbSess)
                    }).then(()=>{
                      if(sessionsArray.length > 0){
                        console.log('#!!-.POST/-'+req.body.type+'- sessionsArray:',sessionsArray)
                        let maxTime = 0
                        let lastModSession
                        let unexpiredSessIds = sessionsArray.map((x)=>{
                          if(x.expires.getTime() > maxTime){
                            maxTime = x.expires.getTime()
                            lastModSession = x
                          }
                          return x._id
                        })
                        console.log('#!!-.POST/-'+req.body.type+'- assegno i vecchi dati utente alla sessione: ',JSON.parse(lastModSession.session).data)
                        req.session.data = JSON.parse(lastModSession.session).data
                        unexpiredSessIds.push(req.session.id) //push current session in the unexpiredSessIds array
                        console.log('#!!-.POST/-'+req.body.type+'- aggiungo all\'array unexpiredSessIds la sessione attuale:',unexpiredSessIds)
                        console.log('#!!-.POST/-'+req.body.type+"- aggiorno le sessioni dell'utente riscrivendo il campo session con unexpiredSessIds.")
                        LNP.MDB.collection('users').updateOne(
                          { _id: req.session.user },
                          { $set: 
                            { 
                              session: unexpiredSessIds, 
                              docUpdatedAt: new Date() 
                            }
                          },
                          function(err){
                            if(err){console.log("#!!-.POST/-"+req.body.type+"- errore DB durante il salvataggio della sessione dell'utente:",err)}
                            console.log("#!!-.POST/-"+req.body.type+"- rispondo al client con:",{_id:pubkey,btcaddress:address})
                            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                            return res.json({
                              _id:pubkey,
                              btcaddress:address,
                              message:{type:'notify',text:'Logged in!'}
                            })
                          }
                        )
                      }else{
                        console.log('#!!-.POST/-'+req.body.type+'- tutte le sessioni sono SCADUTE...')
                        console.log('#!!-.POST/-'+req.body.type+"- aggiorno le sessioni dell'utente inserendo nel campo session l'id della sessione attuale.")
                        LNP.MDB.collection('users').updateOne(
                          { _id: req.session.user },
                          { $set: 
                            { 
                              session: [req.session.id],
                              docUpdatedAt: new Date()
                            }
                          },
                          function(err){
                            if(err){console.log("#!!-.POST/-"+req.body.type+"- errore DB durante il salvataggio della sessione dell'utente:",err)}
                            console.log("#!!-.POST/-"+req.body.type+"- rispondo al client con:",{_id:pubkey,btcaddress:address})
                            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                            return res.json({
                              _id: pubkey,
                              btcaddress: address,
                              balance: dbUser.account.balance,
                              message: {type:'notify',text:'Logged in!'}
                            })
                          }
                        )
                      }
                    }).catch(error => console.log("#!!-.POST/-"+req.body.type+"- errore lettura db sessioni:",error))
                  }else{
                    console.log('#!!-.POST/-'+req.body.type+'- NON aveva nessuna sessione:')
                    console.log('#!!-.POST/-'+req.body.type+"- aggiorno le sessioni dell'utente inserendo nel campo session l'id della sessione attuale.")
                    LNP.MDB.collection('users').updateOne(
                      { _id: req.session.user }, 
                      { $set: 
                        { 
                          session: [req.session.id],
                          docUpdatedAt: new Date()
                        }
                      }, 
                      function(err){
                        if(err){console.log("#!!-.POST/-"+req.body.type+"- errore DB durante il salvataggio della sessione dell'utente:",err)}
                        console.log("#!!-.POST/-"+req.body.type+"- rispondo al client con:",{_id:pubkey,btcaddress:address})
                        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                        return res.json({
                          _id: pubkey,
                          btcaddress: address,
                          balance: dbUser.account.balance,
                          message: {type:'notify',text:'Logged in!'}
                      })
                    })
                  }
                })
                
              }else{
                if(pubkey == LNP.config.rootPubKey){
                  let userData = LNP.newUser(pubkey,address,req.session.id,true)
                  userData.lastLogin = new Date()
                  if(LNP.validateWallet(userData)){
                    LNP.MDB.collection('users').insertOne(userData, (error, user)=>{
                      if(error) {return console.log('#!!-.POST/- mongo error',error)}
                      req.session.user = pubkey
                      req.session.admin = true
                      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                      return res.json({
                        _id:pubkey,
                        btcaddress:address,
                        message:{type:'notify',text:'Logged in!'}
                      })
                    })
                  }else{
                    console.log('#!!-.POST/-'+req.body.type+'- dati non validi!')
                    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                    res.json({message:{ type:'alert', text:'Need a valid wif format private key... How did you do?'}})
                  }
                }else{
                  console.log('#!!-.POST/-'+req.body.type+'- non ho trovato nessun utente con la stessa pubkey!')
                  console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con:',{alert: 'Key not found'})
                  LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                  return res.json({message:{type:'alert',text:'Key not found!'}})
                }
              }
            }).catch(error => { return console.log(error) })
          }catch(err){
            console.log('#!!-.POST/-'+req.body.type+'- CHIAVE NON VALIDA O ERRORE LIBRERIA BITCOIN:',err)
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            res.json({message:{type:'alert',text:'Need a valid wif format private key'}})
          }
        }else{
          console.log('#!!-.POST/-'+req.body.type+'- CHIAVE NON VALIDA:')
          console.log(req.body.privkey)
          console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:')
          console.log({alert: 'Need a valid wif format private key'})
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json({message:{type:'alert',text:'Need a valid wif format private key'}})
        }
      }
    }
  )
}