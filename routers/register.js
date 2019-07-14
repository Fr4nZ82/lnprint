var LNP = require('./utils')

module.exports = (req,res)=>{
  LNP.ifUser(req,res,
    (actualUser)=>{
      console.log('#!!-.POST/-'+req.body.type+'- User already registered and logged:',actualUser)
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      return res.json({message:{type: 'alert', text: 'You are already registered and logged! How did you do?'}})
    },
    ()=>{
      console.log('#!!-.POST/-'+req.body.type+'- controllo se pubkey esiste')
      if( req.body.pubkey && req.body.address) {
        console.log('#!!-.POST/-'+req.body.type+'- esiste quindi cerco nel db tra le key degli utenti se ne trovo una uguale.')
        LNP.MDB.collection('users').findOne({ _id: req.body.pubkey })
        .then(result => {
          //console.log(result)
          if(result){ //KEY ESISTENTE
            console.log('#!!-.POST/-'+req.body.type+'- ho trovato un utente con una delle due uguale:',result)
            LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({message:{type: 'alert', text: 'Key already exist! How did you do?'}})
          }else{ //KEY NUOVA
            console.log('#!!-.POST/-'+req.body.type+'- non ho trovato utenti con una chiave uguale! provo a validare pubkey e btcaddress')
            let userData = LNP.newUser(req.body.pubkey, req.body.address, req.session.id)
            if(LNP.validateWallet(userData)){
              console.log('#!!-.POST/-'+req.body.type+'- sono validi quindi li inserisco nel db')
              LNP.MDB.collection('users').insertOne(userData, (error, user)=>{
                if(error) {return console.log('#!!-.POST/- mongo error',error)}
                console.log("#!!-.POST/-"+req.body.type+"- e rispondo al client con {ok : 'ok'}")
                LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json({ok: 'ok'})
              })
            }else{
              console.log('#!!-.POST/-'+req.body.type+'- dati non validi!')
              LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
              res.json({message:{ type:'alert', text:'Need a valid wif format private key... How did you do?'}})
            }
          }
        }).catch(error => { console.log('#!!-.POST/- mongo error',error) })
      }else{
        return console.log('#!!-.POST/-'+req.body.type+'- pubkey non esiste... impossibile!')
      }
    }
  )
}