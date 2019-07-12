var LNP = require('../app.js')

var basePage = require('../views/basePage.js')

var router      = LNP.express.Router(),
    bitcoin     = LNP.bitcoin,
    wif         = LNP.wif,
    deepDiff    = LNP.deepDiff,
    allSockets  = LNP.allSockets,
    img2b64     = LNP.img2b64,
    fs          = LNP.fs,
    path        = LNP.path,
    MDB         = LNP.MDB

var pauselog = (req,intestation,mc)=>{
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
    allSockets.forEach((sock)=>{
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
var newUser = ()=>{
  return {
    balance: 0,
    payreq: [], // ONLY PENDING
    userRemotePubkeys: [],
    history:[],
    ochistory:[]
  }
}
function validatePrivkey(key){
  key = key.toString()
  return (/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(key))
}
function validateWallet(wallet){
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
function validateBtcAddress(addr){
  addr = addr.toString()
  return (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr))
}

//***********************************************************************[ MIDDLEWARE DI CONTROLLO ]
//**************************************************************Da qui passano tutte le chiamate /
var controlMiddleware = function(req,res,next){
  console.log('#!!-MC- middleware di controllo avviato su questa REQUEST: ',req.url)
  console.log('#!!-MC- con questi dati di sessione: ',req.session)
  console.log('#!!-MC- con questo json dal client: ',req.body)
  if(!req.session.data){                //Prima volta qui... o cookie cancellato
    req.session.data = {
      reqs: 1,
      page: {name: 'home', first: 'no'}
    }
    console.log('#!!-MC- data NON ESISTE, la creo e la assegna alla sessione: ',req.session.data)
  }else{
    console.log('#!!-MC- data ESISTE')
    req.session.data.reqs++
    req.userSocketIds = []
    if(req.session.user && req.session.user != ''){
      allSockets.forEach((sock)=>{
        if(sock.user == req.session.user){
          req.userSocketIds.push(sock._id)
        }
      })
      console.log('#!!-MC- utente LOGGATO con sockets:',req.userSocketIds)
    }else{
      console.log('#!!-MC- utente NON LOGGATO')
    }
    console.log("#!!-MC- controllo che page non sia mai dashboard quando l'utente non esiste: ")
    if(req.session.data.page.name == 'dashboard' && !req.session.user){
      console.log("#!!-MC- la pagina è dashboard e l'utente non esiste!! passo al gestore errori")
      let err = {code:10,message:'page can not be dashboard if user is not logged'}
      next(err)
    }
  }
  //console.log('allSockets: ',allSockets)
  //console.log('REQ: ',req)
  pauselog(req, '#!!-MC/-','mc')
  next()
}
router.use(controlMiddleware)


//*****************************************************************************************[ GET / ]
router.get('/', function(req,res){
  console.log('#!!-GET/- richiesta GET / arrivata:')
  if(!!req.session.data.uploading){
    delete req.session.data.uploading
    console.log('#!!-GET/- Ho cancellato req.data.uploading... ma non dovrebbe esserci!')
  }
  res.send(basePage)
})

//****************************************************************************************[ POST / ]
router.post('/', function(req,res){
  console.log('#!!-.POST/-- richiesta POST / type: '+req.body.type+' arrivata')
  function ifUser(ifExist,ifNotExist,ifErr){
    ifErr = ifErr || 'no'
    if(req.session.user){
      console.log('#!!-.POST/-'+req.body.type+'- cerco nel db i dati utente:')
      MDB.collection('users').findOne({_id:req.session.user}).then(actualUser => {
        if(actualUser._id && actualUser._id != ""){ //KEY ESISTENTE
          console.log('#!!-.POST/-'+req.body.type+'- ho trovato un utente con lo stesso id!')
          //console.log('actualUser',actualUser)
          if(actualUser._id == LNP.config.rootPubKey){
            if(actualUser.admin !== true){
              actualUser.admin = true
              MDB.collection('users').updateOne({_id:actualUser._id},{$set:{'admin': true}},(err)=>{
                if(err){
                  let nm = {notifyMsg:{type:'alert',text: 'server error, try later'}}
                  console.log('#!!-.POST/-'+req.body.type+'- errore mongoDB:',error)
                  console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:',nm)
                  pauselog(req, '#!!-.POST/-'+req.body.type)
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
            let nm = {notifyMsg:{type:'alert',text: 'user not found in the db'}}
            console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:',nm)
            pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json(nm)
          }
        }
      }).catch(error => {
        if(ifErr != 'no'){
          ifErr(error)
        }else{
          let nm = {notifyMsg:{type:'alert',text: 'server error, try later'}}
          console.log('#!!-.POST/-'+req.body.type+'- errore mongoDB:',error)
          console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:',nm)
          pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json(nm)
        }
      })
    }else{
      ifNotExist()
    }
  }
  if(req.session && req.session.data){
    //******************************************************************************body.type='page'
      if(req.body.type == 'page'){
      console.log('#!!-.POST/-'+req.body.type+'- assegno il req.body.name (nome pagina) alla sessione')
      req.session.data.page.name = req.body.name
      console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati: ',req.session.data)
      pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(req.session.data)

    //*********************************************************************body.type='req_ticker'
}else if(req.body.type == 'req_ticker'){
      pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(LNP.ticker)

    //*********************************************************************body.type='req_bitcoinFees'
}else if(req.body.type == 'req_bitcoinFees'){
      pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(LNP.bitcoinFees)

    //*********************************************************************body.type='req_user_data'
}else if(req.body.type == 'req_user_data') {
      console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
      let clientConf = {
        maxInvoiceAmt: LNP.config.maxInvoiceAmt,
        productImgWidth: LNP.config.productImgWidth
      }
      ifUser(
        (actualUser)=>{
          delete actualUser.session
          delete actualUser.__v
          delete actualUser.date_modified
          if(actualUser._id == LNP.config.rootPubKey){
            actualUser.root = true
            actualUser.admin = true
          }else if(req.session.admin === true){
            actualUser.admin = true
          }else if(actualUser.admin){
            delete actualUser.admin
          }
          actualUser.account.history.forEach((tx,i)=>{
            actualUser.account.history[i].date = Date.parse(tx.date)
          })
          console.log('#!!-.POST/-'+req.body.type+'- rispondo al server con {clientUserData, clientConf}:',clientConf)
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json({page:req.session.data.page,user: actualUser, conf: clientConf})
        },
        ()=>{
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json({page:req.session.data.page,user:{_id: ''},conf: clientConf,notifyMsg:{type:'msg',text:'wut?'}})
        }
      )

    //**************************************************************************body.type='register'
}else if(req.body.type == 'register') {
      ifUser(
        (actualUser)=>{
          console.log('#!!-.POST/-'+req.body.type+'- User already registered and logged:',actualUser)
          pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({notifyMsg:{type: 'alert', text: 'You are already registered and logged! How did you do?'}})
        },
        ()=>{
          console.log('#!!-.POST/-'+req.body.type+'- controllo se pubkey esiste')
          if( req.body.pubkey && req.body.address) {
            console.log('#!!-.POST/-'+req.body.type+'- esiste quindi cerco nel db tra le key degli utenti se ne trovo una uguale.')
            MDB.collection('users').findOne({ _id: req.body.pubkey })
            .then(result => {
              //console.log(result)
              if(result){ //KEY ESISTENTE
                console.log('#!!-.POST/-'+req.body.type+'- ho trovato un utente con una delle due uguale:',result)
                pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json({notifyMsg:{type: 'alert', text: 'Key already exist! How did you do?'}})
              }else{ //KEY NUOVA
                console.log('#!!-.POST/-'+req.body.type+'- non ho trovato utenti con una chiave uguale! provo a validare pubkey e btcaddress')
                let userData = {
                  _id: req.body.pubkey,
                  btcaddress: req.body.address,
                  session: [req.session.id],
                  account: {
                    balance: 0,
                    payreq: [], // ONLY PENDING
                    userRemotePubkeys: [],
                    history:[],
                    ochistory:[]
                  }
                }
                if(validateWallet(userData)){
                  console.log('#!!-.POST/-'+req.body.type+'- sono validi quindi li inserisco nel db')
                  MDB.collection('users').insertOne(userData, (error, user)=>{
                    if(error) {return console.log('#!!-.POST/- mongo error',error)}
                    console.log("#!!-.POST/-"+req.body.type+"- e rispondo al client con {ok : 'ok'}")
                    pauselog(req, '#!!-.POST/-'+req.body.type)
                    return res.json({ok: 'ok'})
                  })
                }else{
                  console.log('#!!-.POST/-'+req.body.type+'- dati non validi!')
                  pauselog(req, '#!!-.POST/-'+req.body.type)
                  res.json({notifyMsg:{ type:'alert', text:'Need a valid wif format private key... How did you do?'}})
                }
              }
            }).catch(error => { console.log('#!!-.POST/- mongo error',error) })
          }else{
            return console.log('#!!-.POST/-'+req.body.type+'- pubkey non esiste... impossibile!')
          }
        }
      )

    //*****************************************************************************body.type='login'
}else if(req.body.type == 'login') {
      ifUser(
        (actualUser)=>{
          console.log('#!!-.POST/-'+req.body.type+'- User already registered and logged:',actualUser)
          pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({notifyMsg:{type: 'alert', text: 'You are already registered and logged! How did you do?'}})
        },
        ()=>{
          console.log('#!!-.POST/-'+req.body.type+'- controllo se privkey esiste nei dati arrivati dal client')
          if( req.body.privkey ) {
            console.log('#!!-.POST/-'+req.body.type+'- esiste, quindi controllo che sia nel formato wif...')
            if(validatePrivkey(req.body.privkey)){
              console.log('#!!-.POST/-'+req.body.type+'- OK derivo chiave pubblica e indirizzo btc')
              try{
                let keyPair = bitcoin.ECPair.fromWIF(req.body.privkey)
                let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
                let pubkey = keyPair.publicKey.toString('hex')
                req.body.privkey = ''
                keyPair = ''
                console.log('#!!-.POST/-'+req.body.type+'- cerco nel db tra le chiavi pubbliche degli utenti se ne trovo una uguale:')
                MDB.collection('users').findOne({ _id: pubkey }).then(result => {
                  if(result){ //KEY EXIST
                    console.log('#!!-.POST/-'+req.body.type+'- ne ho trovata una uguale!:',result)
                    console.log('#!!-.POST/-'+req.body.type+"- assegno l'id utente alla sessione in corso.")
                    req.session.user = result._id
                    console.log('#!!-.POST/-'+req.body.type+"- se è un admin la sessione prende il valore admin")
                    if(result._id == LNP.config.rootPubKey){
                      if(result.admin !== true){
                        MDB.collection('users').findOneAndUpdate({_id:result._id},{$set:{admin:true}})
                      }
                      result.admin = true
                    }
                    if(result.admin === true){
                      req.session.admin = true
                    }else{
                      req.session.admin = false
                      delete req.session.admin
                    }
                    console.log('#!!-.POST/-'+req.body.type+'- controllo se utente aveva delle vecchie sessioni...')
                    if(result.session.length > 0){
                      console.log('#!!-.POST/-'+req.body.type+'- aveva delle sessioni:',result.session)
                      console.log('#!!-.POST/-'+req.body.type+'- ognuna la cerco nella collezione sessions:',result.session)
                      let sessionsArray = []
                      MDB.collection('sessions').find({_id: {$in: result.session}}).forEach(function(dbSess) {
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
                          MDB.collection('users').updateOne({ _id: req.session.user }, { $set: { session: unexpiredSessIds }}, function(err,ok){
                            if(err){return console.log("#!!-.POST/-"+req.body.type+"- errore lettura db Users:",err)}
                            console.log("#!!-.POST/-"+req.body.type+"- rispondo al client con:",{_id:pubkey,btcaddress:address})
                            pauselog(req, '#!!-.POST/-'+req.body.type)
                            let theRes = {
                              _id:pubkey,
                              btcaddress:address,
                              notifyMsg:{type:'msg',text:'Logged in!'}
                            }
                            return res.json(theRes)
                          })
                        }else{
                          console.log('#!!-.POST/-'+req.body.type+'- sessione SCADUTA:')
                          console.log('#!!-.POST/-'+req.body.type+"- aggiorno le sessioni dell'utente inserendo nel campo session l'id della sessione attuale.")
                          MDB.collection('users').updateOne({ _id: req.session.user }, { $set: { session: [req.session.id] }}, function(err,ok){
                            console.log("#!!-.POST/-"+req.body.type+"- rispondo al client con:",{_id:pubkey,btcaddress:address})
                            pauselog(req, '#!!-.POST/-'+req.body.type)
                            return res.json({
                              _id: pubkey,
                              btcaddress: address,
                              balance: result.account.balance,
                              notifyMsg: {type:'msg',text:'Logged in!'}
                            })
                          })
                        }
                      }).catch(error => console.log("#!!-.POST/-"+req.body.type+"- errore lettura db sessioni:",error))
                    }else{
                      console.log('#!!-.POST/-'+req.body.type+'- NON aveva nessuna sessione:')
                      console.log('#!!-.POST/-'+req.body.type+"- aggiorno le sessioni dell'utente inserendo nel campo session l'id della sessione attuale.")
                      MDB.collection('users').updateMany({ _id: req.session.user }, { $set: { session: [req.session.id] }}, function(err,ok){
                        console.log("#!!-.POST/-"+req.body.type+"- rispondo al client con:",{_id:pubkey,btcaddress:address})
                        pauselog(req, '#!!-.POST/-'+req.body.type)
                        return res.json({
                          _id: pubkey,
                          btcaddress: address,
                          balance: result.account.balance,
                          notifyMsg: {type:'msg',text:'Logged in!'}
                        })
                      })
                    }
                  }else{
                    if(pubkey == LNP.config.rootPubKey){
                      let userData = {
                        _id: pubkey,
                        btcaddress: address,
                        session: [req.session.id],
                        account: {
                          balance: 0,
                          payreq: [], // ONLY PENDING
                          userRemotePubkeys: [],
                          history:[],
                          ochistory:[]
                        },
                        admin: true
                      }
                      if(validateWallet(userData)){
                        MDB.collection('users').insertOne(userData, (error, user)=>{
                          if(error) {return console.log('#!!-.POST/- mongo error',error)}
                          req.session.user = pubkey
                          req.session.admin = true
                          pauselog(req, '#!!-.POST/-'+req.body.type)
                          return res.json({
                            _id:pubkey,
                            btcaddress:address,
                            notifyMsg:{type:'msg',text:'Logged in!'}
                          })
                        })
                      }else{
                        console.log('#!!-.POST/-'+req.body.type+'- dati non validi!')
                        pauselog(req, '#!!-.POST/-'+req.body.type)
                        res.json({notifyMsg:{ type:'alert', text:'Need a valid wif format private key... How did you do?'}})
                      }
                    }else{
                      console.log('#!!-.POST/-'+req.body.type+'- non ho trovato nessun utente con la stessa pubkey!')
                      console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con:',{alert: 'Key not found'})
                      pauselog(req, '#!!-.POST/-'+req.body.type)
                      return res.json({notifyMsg:{type:'alert',text:'Key not found!'}})
                    }
                  }
                }).catch(error => { return console.log(error) })
              }catch(err){
                console.log('#!!-.POST/-'+req.body.type+'- CHIAVE NON VALIDA O ERRORE LIBRERIA BITCOIN:',err)
                pauselog(req, '#!!-.POST/-'+req.body.type)
                res.json({notifyMsg:{type:'alert',text:'Need a valid wif format private key'}})
              }
            }else{
              console.log('#!!-.POST/-'+req.body.type+'- CHIAVE NON VALIDA:')
              console.log(req.body.privkey)
              console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati:')
              console.log({alert: 'Need a valid wif format private key'})
              pauselog(req, '#!!-.POST/-'+req.body.type)
              res.json({notifyMsg:{type:'alert',text:'Need a valid wif format private key'}})
            }
          }
        }
      )

    //****************************************************************************body.type='logout'
}else if(req.body.type == 'logout') {
      if(req.session.user) {
        req.session.data.page.name = 'home'
        console.log('#!!-.POST/-'+req.body.type+'- esiste quindi ne elimino il campo user')
        req.userSocketIds.forEach((sock)=>{
          console.log('disconnetto il socket ',sock)
          LNP.io.sockets.connected[sock].disconnect(true)
        })
        delete req.session.user
        if(!!req.session.admin){delete req.session.admin}
        console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con:',{ok: 'ok'})
        console.log('allSockets',allSockets)
        pauselog(req, '#!!-.POST/-'+req.body.type)
        res.json({ok: 'ok'})
      }else{
        console.log('#!!-.POST/-'+req.body.type+'- NON esiste quindi ALERT')
        pauselog(req, '#!!-.POST/-'+req.body.type)
        res.json({notifyMsg:{type:'alert',text:'can not log out because you are not logged in'}})
      }

    //*********************************************************************body.type='req_node_info'
}else if(req.body.type == 'req_node_info') {
      pauselog(req, '#!!-.POST/-'+req.body.type)
      return res.json({
        uri: LNP.lnClient.nodeInfo.uri,
        alias: LNP.lnClient.nodeInfo.alias
      })

    //***********************************************************************body.type='gen_invoice'
}else if(req.body.type == 'gen_invoice') {
      if(req.body.from){
        if(req.body.amt < LNP.config.maxInvoiceAmt){
          LNP.lnClient.genInvoice(req.body, (payreq)=>{
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
              is_outgoing: false
            }
            function insertInvoice(invData){
              MDB.collection('invoices').insertOne(invData, (e, invoice)=>{
                if(e){return console.log('#!!-.POST/-'+req.body.type+'- error!',e)}
                console.log('#!!-.POST/-'+req.body.type+'- invoice saved on invoices collection')
                delete invData.fba
                delete invData.payment_secret
                pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json(invData)
              })
            }
            ifUser(
              (actualUser)=>{
                MDB.collection('users').updateMany(
                  { _id: req.session.user },
                  { $addToSet: { 'account.payreq': invoiceData._id }},
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
          pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({notifyMsg:{type:'alert',text:'max invoice amt exceeded'}})
        }
      }

    //***********************************************************************body.type='gen_newAddress'
}else if(req.body.type == 'gen_newAddress') {
      console.log('#!!-.POST/-'+req.body.type+'- richiesta: ',req.body)
      if(req.body.from){
        LNP.lnClient.newAddress((err,newBtcAddr)=>{
          if(err){return console.log('create new address error: ',err)}
          console.log('INDIRIZZO GENERATO:', newBtcAddr)
          if(req.body.from == 'balanceCard'){
            var from = 'deposit'
          }else if(req.body.from == 'donate'){
            var from = 'donation'
          }else if(req.body.from == 'payment'){
            var from = 'payment'
          }else{
            console.log('#!!-.POST/-'+req.body.type+'- from inaspettato')
            pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({notifyMsg:{type:'alert',text:'no valid from'}})
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
          console.log(addressData)
          var insertAddress = (aD)=>{
            MDB.collection('addresses').insertOne(aD, (e, addr)=>{
              if(e){return console.log('#!!-.POST/-'+req.body.type+'- error!',e)}
              console.log('#!!-.POST/-'+req.body.type+'- indirizzo salvato nella collection indirizzi')
              pauselog(req, '#!!-.POST/-'+req.body.type)
              console.log('ad',aD)
              return res.json(aD)
            })
          }
          ifUser(
            (actualUser)=>{
              MDB.collection('users').updateMany({ _id: req.session.user }, { $addToSet: { 'usedAddress': addressData._id }}, (err)=>{
                if(err){return console.log('#!!-.POST/-'+req.body.type+'- error!',err)}
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
    //***********************************************************************body.type='dec_invoice'
}else if(req.body.type == 'dec_invoice') {
      console.log('#!!-.POST/-'+req.body.type+'- nuova invoice da decodificare:',req.body)
      if(req.body.invoice){
        let invoice = req.body.invoice
        let prefix = req.body.invoice.substr(0,10)

        console.log("originale invoice",invoice)

        if(prefix == "lightning:"){
          invoice = req.body.invoice.substr(10)
        }
        console.log("invoice now:",invoice)
        console.log("prefix:",prefix)
        ifUser(
          (actualUser)=>{
            LNP.lnClient.decodeInvoice(invoice, (err,decodedInvoice)=>{
              if(!!err){
                pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json({notifyMsg:{type:'alert',text: 'need valid BOLT11 invoice'}})
              }
              console.log('INVOICE DECODIFICATA, la spedisco al client')
              let di = {
                invoice: invoice,
                expires_at: decodedInvoice.expires_at,
                sats: decodedInvoice.tokens
              }
              pauselog(req, '#!!-.POST/-'+req.body.type)
              return res.json(di)
            })
          },
          ()=>{
            console.log('#!!-.POST/-'+req.body.type+'- only logged users can decode invoice')
            return res.json({notifyMsg:{type:'alert',text:'8======D'}})
          }
        )
      }

    //***********************************************************************body.type='pay_invoice'
}else if(req.body.type == 'pay_invoice'){
      console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
      ifUser(
        (actualUser)=>{
          LNP.lnClient.decodeInvoice(req.body.invoice, (err,decodedInvoice)=>{
            if(err){
              pauselog(req, '#!!-.POST/-'+req.body.type)
              return res.json({notifyMsg:{type:'alert',text: 'need valid BOLT11 invoice'}})
            }
            console.log('#!!-.POST/-'+req.body.type+'- Controllo se il saldo è sufficiente per pagaree l\'invoice')
            if(actualUser.account.balance >= decodedInvoice.tokens){
              if(decodedInvoice.tokens <= LNP.config.maxInvoiceAmt){
                var resultSended = false
                setTimeout(function () {
                  if(!resultSended){
                    resultSended = true
                    pauselog(req, '#!!-.POST/-'+req.body.type)
                    res.json({notifyMsg:{type:'msg',text:'payment take time... wait the result'}})
                  }
                  else{
                    pauselog(req, '#!!-.POST/-'+req.body.type)
                    res.json({ok:'ok'})
                  }
                }, 2000)
                LNP.lnClient.payInvoice(req.body.invoice,(err,result)=>{
                  if(err){
                    console.log('#!!-.POST/-'+req.body.type+'- payInvoice error: ',err)
                    resultSended = true
                    let dataForClient = {}
                    if(err[2] == 'payment is in transition'){
                      dataForClient={notifyMsg:{type:'alert',text:'error: payment is in transition, wait confirmation or timeout'}}
                    }else{
                      dataForClient={notifyMsg:{type:'alert',text:'error: payment error'}}
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
                    MDB.collection('users').findOneAndUpdate(
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
                        return res.sendStatus(503)
                      }
                      console.log('result.hops',result.hops)//Take a look
                      if(result.hops.length == 1){
                        console.log('#!!-.POST/-'+req.body.type+'- il destinatario del pagamento era il primo hop...')
                        let userRemotePubkeys = uRP.value.account.userRemotePubkeys || []
                        var chanMessage = userRemotePubkeys.length < 2 ? 'channels_disclosure' : 'channels_info'
                        let paymentChannel = result.hops[0].chan_id
                        console.log('#!!-.POST/-'+req.body.type+'- userRemotePubkeys',userRemotePubkeys)
                        console.log('#!!-.POST/-'+req.body.type+'- payment channel id',paymentChannel)
                        LNP.updateChannels((err,nodeChannelsList)=>{
                          if(!!err){
                            return res.json({notifyMsg:{type:'alert',text:'server error, please try later'}})
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
                          MDB.collection('users').updateOne({_id:req.session.user},{$set:{'account.userRemotePubkeys': userRemotePubkeys}},(err)=>{
                            if(err){
                              console.log('#!!-.POST/-'+req.body.type+'- error',err)
                              res.sendStatus(503)
                            }else{
                              console.log('#!!-.POST/-'+req.body.type+'- Nodi e canali utente salvati nel db:',userRemotePubkeys)

                              req.userSocketIds.forEach((sock)=>{
                                LNP.io.sockets.to(sock).emit(chanMessage, userRemotePubkeys)
                              })
                            }
                          })
                        })
                      }
                    })
                    pauselog(req, '#!!-.POST/-'+req.body.type)
                  }
                })
              }else{
                console.log('#!!-.POST/-'+req.body.type+'- max invoice amt exceeded')
                pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json({notifyMsg:{type:'alert',text:'max invoice amt exceeded'}})
              }
            }else{
              console.log('#!!-.POST/-'+req.body.type+'- no founds to pay invoice')
              pauselog(req, '#!!-.POST/-'+req.body.type)
              return res.json({notifyMsg:{type:'alert',text:'no founds to pay invoice'}})
            }
          })
        },
        ()=>{
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json({_id: ''})
        }
      )

    //*********************************************************************body.type='payFromAccount'
}else if(req.body.type == 'payFromAccount') {
      console.log('#!!-.POST/-'+req.body.type+'- richiesta: ',req.body)
      console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
      if(req.body.from){
        if(req.body.from == 'donate'){
          var from = 'donation'
        }else{
          var from = 'payment'
        }
        ifUser(
          (actualUser)=>{
            console.log('#!!-.POST/-'+req.body.type+'- Controllo se il saldo è sufficiente per il pagamento')
            if(actualUser.account.balance >= req.body.amt){
              MDB.collection('users').findOneAndUpdate(
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
                if(err){console.log('#!!-.POST/-'+req.body.type+'- error',err)}else{
                  let uAccount = actualUser.account
                  uAccount.balance = uAccount.balance - req.body.amt
                  pauselog(req, '#!!-.POST/-'+req.body.type)
                  return res.json({account:uAccount,notifyMsg:{type:'msg',text:'payment done!'}})
                }
              })
            }else{
              pauselog(req, '#!!-.POST/-'+req.body.type)
              return res.json({notifyMsg:{type:'alert',text:'no founds to pay invoice'}})
            }
          },
          ()=>{
            console.log('#!!-.POST/-'+req.body.type+'- NON esiste, rispondo al client con questi dati:',{_id: ''})
            pauselog(req, '#!!-.POST/-'+req.body.type)
            res.json({_id: ''})
          }
        )
      }

      //*********************************************************************body.type='payFromAccount'
}else if(req.body.type == 'pay_onchain') {
      console.log('#!!-.POST/-'+req.body.type+'- richiesta: ',req.body)
      console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
      if(req.body.from && req.body.address && req.body.amt && req.body.fee && req.body.amt > 0){
        if(validateBtcAddress(req.body.address)){
          var from = req.body.from == 'donate' ? 'donation' : 'payment'
          ifUser(
            (actualUser)=>{
              if(actualUser.account.balance >= req.body.amt){
                LNP.lnClient.sendCoins(req.body.address, req.body.amt, req.body.fee, (err,txid)=>{
                  if(err){
                    console.log('#!!-.POST/-'+req.body.type+'- sendCoins error: ',err)
                    if(err[2] && err[2].details === 'transaction output is dust'){
                      return res.json({notifyMsg:{type:'alert',text:'amount is too low'}})
                    }
                    if(err[1] == 'ExpectedAddress'){
                      return res.json({notifyMsg:{type:'alert',text:'need a valid address'}})
                    }
                  }
                  LNP.updateOctx((err,octxInDb,poctxs)=>{
                    if(!!err){
                      return res.json({notifyMsg:{type:'alert',text:'server error, please try later'}})
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
                      MDB.collection('users').findOneAndUpdate(
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
                          return res.sendStatus(503)
                        }
                        pauselog(req, '#!!-.POST/-'+req.body.type)
                        return res.json({ txData: dataForClient })
                      })
                    }
                  })
                })
              }else{
                console.log('#!!-.POST/-'+req.body.type+'- not enough founds for this tx')
                pauselog(req, '#!!-.POST/-'+req.body.type)
                return res.json({notifyMsg:{type:'alert',text:'not enough founds for this tx'}})
              }
            },
            ()=>{
              console.log('#!!-.POST/-'+req.body.type+'- NON esiste, rispondo al client con questi dati:',{_id: ''})
              pauselog(req, '#!!-.POST/-'+req.body.type)
              res.json({_id: ''})
            }
          )
        }
      }

}else if(req.body.type == 'req_users') {
      ()=>{}


}else if(req.body.type == 'req_products') {
      MDB.collection('products').find({}).toArray((err,products)=>{
        if(err){return console.log('MDB ERROR',err)}
        var pPlusP = [], mp = '', p, ii, hole = 0
        //console.log('A',products)
        if(products.length){
          for( ii=0 ; ii < products.length ; ii++){
            p = products[ii]
            if(p.listable != 'true' && req.session.data.page.name != 'admin'){
              hole++
              continue
            }
            pPlusP.push({
              id: p._id,
              name: p.name,
              readyToSell: p.readyToSell,
              prices: {c:p.copiesPrice,w:p.workPrice,d:p.draftPrice}
            })

            if(req.session.admin === true){
              pPlusP[pPlusP.length - 1].works = p.works
              pPlusP[pPlusP.length - 1].selled = p.selled
            }
            try{
              mpb = fs.readFileSync("./uploads/pphotos/thumbs/" + p.mainPhoto)
              mp = mpb.toString('base64')
            }catch(errr){
              if(!errr.toString().includes("ENOENT")){
                console.log('read file error',errr)
              }
              mp = 'no'
            }
            //console.log('B '+ii,pPlusP)
            pPlusP[ii - hole].mainPhoto = mp
          }
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json(pPlusP)
        }else{
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json(pPlusP)
        }
      })


}else if(req.body.type == 'remove_product') {
      if(req.session.admin === true){
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        var productId = new LNP.mongo.ObjectID(req.body.productId)
        MDB.collection('products').deleteOne({ _id : productId},(err,result)=>{
          if(err){
            console.log('MDB ERROR',err)
          }else{
            pauselog(req, '#!!-.POST/-'+req.body.type)
            res.json({ok:'ok'})
          }
        })
      }


}else if(req.body.type == 'req_product') {
      var productId = new LNP.mongo.ObjectID(req.body.productId)
      MDB.collection('products').findOne({ _id : productId},(err,result)=>{
        if(err){return console.log('MDB ERROR',err)}
        if(req.body.photo == 'true'){
          var photoBuffer, fileData
          result.photos.forEach((photo,i)=>{
            try{
              photoBuffer = fs.readFileSync("./uploads/pphotos/" + photo.fileId)
              fileData = photoBuffer.toString('base64')
            }catch(errr){
              if(!errr.toString().includes("ENOENT")){
                console.log('read file error',errr)
              }
              fileData = 'no'
            }
            //console.log('fileData',fileData)
            result.photos[i].fileData = fileData
          })
        }
        var mpb, mp
        try{
          mpb = fs.readFileSync("./uploads/pphotos/thumbs/" + result.mainPhoto)
          mp = mpb.toString('base64')
        }catch(errr){
          if(!errr.toString().includes("ENOENT")){
            console.log('read file error',errr)
          }
          mp = 'no'
        }

        if(req.session.data.page.name == 'admin'){
          var product = result
        }else{
          var product = {
            id: result._id,
            copiesPrice: result.copiesPrice,
            copiesTime: result.copiesTime,
            description: result.description,
            draftPrice: result.draftPrice,
            draftTime: result.draftTime,
            extLink: result.extLink,
            mainPhoto: mp,
            name: result.name,
            photos: result.photos,
            preset: result.preset,
            readyToSell: result.readyToSell,
            shipmentType: result.shipmentType,
            tags: result.tags,
            video: result.video,
            workPrice: result.workPrice,
            workTime: result.workTime,
            //works: result.works, //toDo map only user work
          }
        }
        pauselog(req, '#!!-.POST/-'+req.body.type)
        res.json(product)
      })


}else if(req.body.type == 'req_presets') {
      if(req.session.admin === true){
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        MDB.collection('presets').find({}).toArray((err,presets)=>{
          if(err){ return console.log('error',err) }
          console.log('#!!-.POST/-'+req.body.type+'- cerco tutti i presets nel db e li invio al client:',presets)
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json(presets)
        })
      }


}else if(req.body.type == 'req_preset') {

      MDB.collection('presets').findOne({name:req.body.name},(err,preset)=>{
        if(err){ return console.log('error',err) }
        console.log('#!!-.POST/-'+req.body.type+'- cerco il presets nel db e lo invio al client:',preset)
        pauselog(req, '#!!-.POST/-'+req.body.type)
        res.json(preset)
      })


}else if(req.body.type == 'save_preset') {
      if(req.session.admin === true){
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        var formData  = req.body.formData,
            presetName = req.body.name
        //console.log('#!!-.POST/-'+req.body.type+'- formData just before findOneAndUpdate: ',formData)
        MDB.collection('presets').findOneAndUpdate(
          {name: presetName},
          {$set:{formData: formData}},
          {upsert:true},
          (err,uP)=>{
            if(err){return console.log('#!!-.POST/-'+req.body.type+'- error',err)}
            pauselog(req, '#!!-.POST/-'+req.body.type)
            return res.json({ok:'ok',notifyMsg:{type:'msg',text:'PRESET SAVED'}})
          }
        )
      }


}else if(req.body.type == 'del_preset') {
      if(req.session.admin === true){
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        var presetName = req.body.name
        MDB.collection('presets').findOneAndDelete({name: presetName},(err,rP)=>{
          if(err){return console.log('#!!-.POST/-'+req.body.type+'- error',err)}
          pauselog(req, '#!!-.POST/-'+req.body.type)
          return res.json({ok:'ok',notifyMsg:{type:'msg',text:'PRESET DELETED'}})
        })
      }


}else if(req.body.type == 'req_works') {
      if(req.session.admin === true){
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        MDB.collection('works').find({}).toArray((err,works)=>{
          if(err){ return console.log('error',err) }
          console.log('#!!-.POST/-'+req.body.type+'- cerco tutti i works nel db e li invio al client:',works)
          pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json(works)
        })
      }


}else if(req.body.type == 'insert_product') {
      if(req.session.admin === true){
        req.session.data.uploading = req.body.nPhotos
        var productData = req.body.productData
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        console.log('#!!-.POST/-'+req.body.type+'- controllo che non ci sia un altro prodotto con lo stesso nome')
        MDB.collection('products').findOne({name: productData.name},(err,sameName)=>{
          if(err){ return console.log('error',err) }
          if(sameName){
            console.log('#!!-.POST/-'+req.body.type+'- Esiste già un prodotto con lo stesso nome!:',sameName)
            return res.json({err: 'duplicated product name'})
          }else{
            productData.photos = []
            productData.works = []
            if(!productData.readyToSell > 0){
              productData.readyToSell = 0
            }
            MDB.collection('products').insertOne(productData, (err,result)=>{
              console.log('#!!-.POST/-'+req.body.type+'- Inserimento dati nel db effettuato: ', result.ops[0])
              console.log('#!!-.POST/-'+req.body.type+'- numero foto da caricare: ',req.session.data.uploading)
              pauselog(req, '#!!-.POST/-'+req.body.type)
              res.json({productId:result.ops[0]._id})
            })
          }
        })
      }


}else if(req.body.type == 'update_product') {
      if(req.session.admin === true){
        req.session.data.uploading = req.body.nPhotos
        console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
        var productData = req.body.productData
        var productId = new LNP.mongo.ObjectID(productData._id)
        MDB.collection('products').findOneAndDelete({_id: productId},(err,removedProduct)=>{
          if(err){ return console.log('error',err) }
          console.log('#!!-.POST/-'+req.body.type+'- vecchio prodotto eliminato dal db')
          console.log(removedProduct)
          if(removedProduct.value.photos.length > 0){
            //remove old photos
          }
          delete productData._id
          productData.photos = []
          productData.works = []
          if(!productData.readyToSell > 0){
            productData.readyToSell = 0
          }
          MDB.collection('products').insertOne(productData, (err,result)=>{
            console.log('#!!-.POST/-'+req.body.type+'- Inserimento dati nel db effettuato: ', result.ops[0])
            console.log('#!!-.POST/-'+req.body.type+'- numero foto da caricare: ',req.session.data.uploading)
            pauselog(req, '#!!-.POST/-'+req.body.type)
            res.json({productId:result.ops[0]._id})
          })
        })
      }
    }



  }else{
    pauselog(req, '#!!-.POST/-'+req.body.type)
    res.json({notifyMsg:{type:'alert',text:'No session found, please refresh'}})
  }
})

module.exports = router
