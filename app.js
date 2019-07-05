var rebootCounter = 0, _running = false

//MAIN WRAPPER FUNCTION
var LnPrint = ()=>{
 
  var config      = require('./cfg'),
      fs          = require('fs'),
      path        = require('path'),
      sharp       = require('sharp'),
      formidable  = require('express-formidable'),
      //stream      = require('stream'),
      express     = require('express'),
      app         = require('express')(),
      http2       = require('spdy'),
      http        = require('http'),
      sio         = require('socket.io'),
      helmet      = require('helmet'),
      Session     = require('express-session'),
      MongoStore  = require('connect-mongo')(Session),
      mongo       = require('mongodb'),
      uglifyEs    = require('uglify-es'),
      compression = require('compression'),
      minify      = require('express-minify'),
      lnClient    = require('./lnd-client.js'),
      request     = require('request'),
      admZip      = require('adm-zip'),
      multer      = require('multer'),
      img2b64     = require('image-to-base64'),
      clc         = require("cli-color"),
      bitcoin     = require('bitcoinjs-lib'),
      wif         = require('wif'),
      deepDiff    = require('deep-diff'),
      csvParse    = require("csv-parse"),
      ticker      = {},
      bitcoinFees = {},
      allSockets  = [],
      remoteAddrs = [],
      MDB

  app.disable('x-powered-by')
  console.log(config.lnpLogo(clc))

  _running = true

  var httpServer = http.createServer((i,o)=>{
    o.writeHead(302,{Location:config.httpsUrl})
    o.end()
  })

  var http2Server = http2.createServer(config.sslOptions,app)
  var io=sio(http2Server)

  //UPDATE ON CHAIN TX FUNCTION                                                                       UPDATE ON CHAIN TX FUNCTION
  var updateOctx = (cb)=>{
    lnClient.listTx((err,nodeTxs)=>{                                                                  //get list of tx from lnd -> nodeTxs
      if(!!err){
        console.log('#!!-APP- errore aggiornamento onchain tx!!',err)
        return cb(err)
      }
      var ops = []
      nodeTxs.forEach(nodeTx => {                                                                     //prepare bulk commands
        nodeTx._id = nodeTx.id
        delete nodeTx.id
        ops.push({
          updateOne: {
            filter: { _id: nodeTx._id },
            update: {$set:  nodeTx },
            upsert: true
          }
        })
      })
      MDB.collection('octx').bulkWrite(ops, { ordered: false }, (err,bulkRes)=>{                      //bulkwrite octx table with nodeTxs data
        if(err){return console.log('#!!-APP- error',err)}
        MDB.collection('octx').find({}).toArray((err,octxInDb)=>{                                     //octxInDb = array of tx objects from octx collection
          if(err){return console.log('#!!-APP- error',err)}
          MDB.collection('pendingoctx').find({}).toArray((err,poctxs)=>{                              //poctxs = array of tx objects from pendingoctx collection
            if(err){return console.log('#!!-APP- error',err)}
            octxInDb.forEach((txData)=>{                                                              //for each tx on db
              txData.users = []
              let poctxsIds = poctxs.map((x)=>{return x._id})                                         //poctxsIds = array of tx _id strings from poctxs array
              if(txData.is_outgoing === false){                                                       //IF IS INBOUND TX
                if(txData.confirmation_count >= config.txMinConfirmations){                           //IF IS CONFIRMED TX
                  if(poctxsIds.includes(txData._id)){                                                 //if is in pending table delete it
                    MDB.collection('pendingoctx').deleteOne({_id:txData._id},(err,result)=>{
                      if(err){return console.log('#!!-APP- error',err)}
                      if(result){console.log('#!!-APP- eliminata pending tx',txData._id)}
                    })
                  }
                  MDB.collection('addresses').find({_id: {$in: txData.destAdrresses}})                //find all addresses in addresses collection matching with
                  .toArray((err,txDestAddresses)=>{                                                   //addresses in the tx destAdrresses array
                    if(err){return console.log('error finding address',err)}
                    if(txDestAddresses.length){                                                       //if found one or more
                      txDestAddresses.forEach((destAddr)=>{                                           //then for each
                        if(destAddr.user != 'noUser' && destAddr.user != ''){                         //if address is binded to an user
                          var txDate = new Date()
                          MDB.collection('users').findOne({_id: destAddr.user},(err,addrUser)=>{      //find that user and..
                            if(err){return console.log('error finding user',err)}
                            addrUserOldTx = addrUser.account.ochistory.map((x)=>{return x.id})
                            if( !addrUserOldTx.includes(txData._id) ){                                //if user onchain history dont already includes this tx
                              MDB.collection('users').findOneAndUpdate(                               //insert it and increment user balance
                                {_id: destAddr.user},{
                                  $inc:{'account.balance': txData.tokens},
                                  $push:{'account.ochistory':{
                                    id: txData._id,
                                    outgoing: txData.is_outgoing,
                                    amt: txData.tokens,
                                    fee: txData.fee,
                                    date: txDate}}
                                  },
                                {projection:{'_id':1}},
                                (err,userId)=>{
                                  if(err){return console.log('#!!-APP- error',err)}
                                  console.log(userId.value._id)
                                  MDB.collection('address').findOneAndUpdate(                         //insert the tx id in the addresses collection and increment amtReceived
                                    {_id: destAddr._id},
                                    {
                                      $inc:{ 'amtReceived': txData.tokens },
                                      $push:{ 'tx': { 'id': txData._id } }
                                    }
                                  )
                                  let dataForClient = {                                               //prepare data for client
                                    id: txData._id,
                                    outgoing: txData.is_outgoing,
                                    amt: txData.tokens,
                                    fee: txData.fee,
                                    date: txDate
                                  }
                                  allSockets.forEach((sock)=>{                                        //if this user is connected notify the confirmed tx
                                    if(sock.user == userId.value._id){
                                      console.log('#!!-APP- socket:',sock)
                                      console.log('#!!-APP- emit: ocdeposit_done', dataForClient)
                                      io.sockets.to(sock._id).emit('ocdeposit_done', dataForClient)
                                    }
                                  })
                                }
                              )
                            }
                          })
                        }
                      })
                    }
                  })
                }else{                                                                                //ELSE IF THE TX IS NOT CONFIRMED
                  if(!poctxsIds.includes(txData._id)){                                                 //if is not in pending table insert it
                    MDB.collection('pendingoctx').insertOne(txData,(err,res)=>{
                        console.log('#!!-APP- aggiunta pending tx',res.ops[0])
                    })
                  }
                }
              }else{                                                                                  //ELSE IF IS OUTGOING TX

              }
            })                                                                                        //!!octxInDb.forEach((txData)=>{
            return cb(null,octxInDb,poctxs)
          })                                                                                          //!!MDB.collection('pendingoctx').find({}).toArray((err,poctxs)=>{
        })                                                                                            //!!MDB.collection('octx').find({}).toArray((err,octxInDb)=>{
      })                                                                                              //!!bulkwrite octx table
    })                                                                                                //!!get list of tx from lnd -> nodeTxs
  }
  //!!UPDATE ON CHAIN TX FUNCTION                                                                     !!UPDATE ON CHAIN TX FUNCTION

  //UPDATE CHANNELS FUNCTION                                                                          UPDATE CHANNELS FUNCTION
  var updateChannels = (cb)=>{
    lnClient.listChannels((err,nodeChannelsList)=>{
      if(!!err){
        console.log('#!!-APP- errore aggiornamento onchain tx!!',err)
        return cb(err)
      }
      MDB.collection('channels').find({}).toArray((err,channelsInDb)=>{
        if(err){return console.log('#!!-APP- error',err)}
        if(channelsInDb.length == 0){
          //POPULATE CHANNELS TABLE
          var ops = [], chansId = []
          nodeChannelsList.forEach(nodeChan => {
            chansId.push(nodeChan.id)
            let nodeId = nodeChan.id
            delete nodeChan.id
            nodeChan._id = nodeId
            nodeChan.updated = new Date(Date.now())
            ops.push({
              updateOne: {
                filter: { _id: nodeId },
                update: {$set:  nodeChan },
                upsert: true
              }
            })
          })
          MDB.collection('channels').bulkWrite(ops, { ordered: false }, (err,bulkRes)=>{
            if(err){return console.log('#!!-APP- error',err)}
            //console.log('CHANNELS COLLECTION POPULATED! list all channels id:',chansId)
          })
        }else{
            //UPDATE CHANNELS TABLE
            let A=[], B=[], oneTime = 0
            channelsInDb.forEach((dbChan,index)=>{
              let dbId = dbChan._id           // SERVE ASSOLUTAMENTE ANCHE SE NON SEMBRA
              delete channelsInDb[index]._id  // SERVE ASSOLUTAMENTE ANCHE SE NON SEMBRA
              channelsInDb[index]._id = dbId  // SERVE ASSOLUTAMENTE ANCHE SE NON SEMBRA
              A.push(dbId)


              nodeChannelsList.forEach((nodeChan,index)=>{
                if(oneTime == 0){
                  let nodeId = nodeChan.id              // SERVE ASSOLUTAMENTE ANCHE SE NON SEMBRA
                  delete nodeChannelsList[index].id     // SERVE ASSOLUTAMENTE ANCHE SE NON SEMBRA
                  nodeChannelsList[index]._id = nodeId  // SERVE ASSOLUTAMENTE ANCHE SE NON SEMBRA per mettere nell'ordine giusto le key degli oggetti
                  B.push(nodeId)
                }
                if(dbChan._id == nodeChan._id){
                  nodeChan.updated = dbChan.updated || new Date(Date.now())
                  let delta = deepDiff(dbChan,nodeChan)
                  if(delta != undefined){ // CANALE MODIFICATO
                    let isCTF = 0
                    let CTFSatDif1, CTFSatDif2
                    delta.forEach((DiffEdit,index)=>{
                      if(DiffEdit.path[0] == 'commit_transaction_fee'){
                        CTFSatDif1 = DiffEdit.lhs - DiffEdit.rhs
                        ++isCTF
                      }else if(DiffEdit.path[0] == 'local_balance' || DiffEdit.path[0] == 'remote_balance'){
                        CTFSatDif2 = DiffEdit.rhs - DiffEdit.lhs
                        ++isCTF
                      }else{
                        isCTF = 0
                      }
                    })
                    // if(isCTF == 2 && (CTFSatDif1 == CTFSatDif2)){
                    //   console.log('#!!-APP- UPDATE CHANNELS - commit_transaction_fee modification on channel '+dbChan._id)
                    // }else{
                    //   console.log('#!!-APP- UPDATE CHANNELS - Channel '+dbChan._id+' changed:',delta)
                    // }
                    nodeChan.updated = new Date(Date.now())
                    //console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
                    MDB.collection('channels').updateOne({_id:dbChan._id},{$set:nodeChan},(err,updated)=>{
                      if(err){return console.log('#!!-APP- error',err)}
                      //console.log('updated',updated.result)
                    })

                  }
                }
              })
              oneTime = 1
            })
            let closedChannels = A.filter(x => !B.includes(x))
            let openedChannels = B.filter(x => !A.includes(x))
            let chansToAdd = nodeChannelsList.filter(x => openedChannels.includes(x._id))
            if(closedChannels.length > 0){
              MDB.collection('channels').deleteMany({_id:{$in:closedChannels}},(err,deletion)=>{
                if(err){return console.log('#!!-APP- error',err)}
              })
            }
            if(openedChannels.length > 0){
              chansToAdd.forEach((xx,ii)=>{chansToAdd[ii].updated = new Date(Date.now())})
              MDB.collection('channels').insertMany(chansToAdd,(err,insertion)=>{
                if(err){return console.log('#!!-APP- error',err)}
              })
            }
          }
        return cb(null,nodeChannelsList)
      })
    })
  }
  //!!UPDATE CHANNELS FUNCTION                                                                        !!UPDATE CHANNELS FUNCTION

  //API REQUEST TICKER FUNCTION
  var reqTicker = (cb)=>{
    request('https://blockchain.info/ticker', { json: true }, (err, res, body) => {
      if (err) {return console.log('#!!-APP- errore richiesta ticker',err)}
      if(body.USD && body.EUR && body.CNY){
        t = {
          usd:{key:'USD',rate:body.USD['15m'],symbol:body.USD.symbol},
          eur:{key:'EUR',rate:body.EUR['15m'],symbol:body.EUR.symbol},
          cny:{key:'CNY',rate:body.CNY['15m'],symbol:body.CNY.symbol},
        }
        //console.log('Ticker Updated:',t)
        return cb(t)
      }
      return cb(ticker)
    })
  }
  //!!API REQUEST TICKER FUNCTION

  //API REQUEST FEES FUNCTION
  var reqFees = (cb)=>{
    request('https://bitcoinfees.earn.com/api/v1/fees/recommended', { json: true }, (err, res, body) => {
      if (err) { return console.log(err) }
      if(body.fastestFee && body.halfHourFee && body.hourFee){
        return cb(body)
      }else{
        console.log('fees non aggirnate, body:',body)
        return bitcoinFees
      }
    })
  }
  //!!API REQUEST FEES FUNCTION

  //UPDATE GEO NAMES
  var updateGeoNames = ()=>{
    console.log('update geonames')
    function downloadAndUnzip(cb){
      request('https://geolite.maxmind.com/download/geoip/database/GeoLite2-City-CSV.zip', { encoding: null }, (err, res, body) => {
        if (err) { return console.log(err) }
        var zip = new admZip(body)
        var zipEntries = zip.getEntries()
        zipEntries.forEach((entry) => {
          if (entry.entryName.includes('GeoLite2-City-Locations-en.csv'))
            return cb(entry.getData().toString('utf8'))
        })
      })
    }
    function csvToObj(cb){
      var geoNames = {}
      downloadAndUnzip((csv)=>{
        //console.log('CSV',csv)
        csvParse(
          csv,
          {
            columns:[null,null,null,'continent',null,'state',null,'region',null,'province','city',null,null,null],
            from: 2,
            delimiter: ','
          },
          function(err, output){
            output.forEach((row,i)=>{
              if(row.continent == ""){row.continent = "__undefined"}
              if(row.state == ""){row.state = "__undefined"}
              if(row.region == ""){row.region = "__undefined"}
              if(row.province == ""){row.province = "__undefined"}
              if(row.city == ""){row.city = "__undefined"}
              row.continent = row.continent.split('.').join(' ')
              row.state     = row.state.split('.').join(' ')
              row.region    = row.region.split('.').join(' ')
              row.province  = row.province.split('.').join(' ')
              if(!geoNames[row.continent]){
                geoNames[row.continent] = {}
                geoNames[row.continent][row.state] = {}
                geoNames[row.continent][row.state][row.region] = {}
                geoNames[row.continent][row.state][row.region][row.province] = []
                geoNames[row.continent][row.state][row.region][row.province].push(row.city)
              }else if(!geoNames[row.continent][row.state]){
                geoNames[row.continent][row.state] = {}
                geoNames[row.continent][row.state][row.region] = {}
                geoNames[row.continent][row.state][row.region][row.province] = []
                geoNames[row.continent][row.state][row.region][row.province].push(row.city)
              }else if(!geoNames[row.continent][row.state][row.region]){
                geoNames[row.continent][row.state][row.region] = {}
                geoNames[row.continent][row.state][row.region][row.province] = []
                geoNames[row.continent][row.state][row.region][row.province].push(row.city)
              }else if(!geoNames[row.continent][row.state][row.region][row.province]){
                geoNames[row.continent][row.state][row.region][row.province] = []
                geoNames[row.continent][row.state][row.region][row.province].push(row.city)
              }else{
                geoNames[row.continent][row.state][row.region][row.province].push(row.city)
              }
            })
            return cb(geoNames)
          }
        )
      })
    }
    function updateDb(){
      csvToObj((geoNames)=>{
        var continents = []
        for (var key in geoNames) {
            if (!geoNames.hasOwnProperty(key)) continue
            geoNames[key]._id = key
            continents.push(geoNames[key])
        }
        delete geoNames
        MDB.collection('geonames').insertMany(continents, (err)=>{
          if(err){return console.log('#!!-APP- error',err)}
          delete continents
          console.log('GEONAMES COLLECTION UPDATED!')
        })
      })
    }
    updateDb()
  }
  //!!UPDATE GEO NAMES

  //CONNECT MONGODB CLIENT NODEJS OFFICIAL DRIVER
  return mongo.MongoClient.connect('mongodb://'+config.dbPath,{useNewUrlParser: true},function(err, client) {
    if(err){
      console.log('#!!-APP- Restart because of MongoClient connection error:',err)
      return _running = false
    }
    console.log("#!!-APP- MongoClient connected")
    MDB = client.db('lnprint')

    //START LN-CLIENT
    return lnClient.start((err)=>{
      if(err){
        console.log('#!!-APP- Exit because of lnClient connection error:',err)
        return _running = false
      }

      //FIRST TIME FEES REQUEST
      reqFees((bitcoinFees)=>{

        //FIRST TIME TICKER REQUEST
        reqTicker((tkr)=>{
          ticker = tkr

          //SESSION OPTIONS
          var session = Session({
            secret: config.sessionOptions.secret,
            name: config.sessionOptions.cookieName,
            cookie: {
              secure: true,
              maxAge: config.sessionOptions.maxAge
            },
            store: new MongoStore( { db: MDB, ttl: ( config.sessionOptions.maxAge / 1000 ) } ),
            resave: config.sessionOptions.resave,
            saveUninitialized: config.sessionOptions.saveUninitialized
          })
          //!!SESSION OPTIONS

          //EXPORT USEFULL THINGS FOR OTHER MODULES
          module.exports = {
            fs:             fs,
            path:           path,
            lnClient:       lnClient,
            io:             io,
            mongo:          mongo,
            MDB:            MDB,
            multer:         multer,
            sharp:          sharp,
            formidable:     formidable,
            updateChannels: updateChannels,
            updateOctx:     updateOctx,
            allSockets:     allSockets,
            ticker:         ticker,
            bitcoinFees:    bitcoinFees,
            img2b64:        img2b64,
            clc:            clc,
            express:        express,
            bitcoin:        bitcoin,
            wif:            wif,
            deepDiff:       deepDiff,
            config:         config,
            app:            app
          }
          //!!EXPORT USEFULL THINGS FOR OTHER MODULES

          //APP SETTINGS/INITIALIZE
          app.set('view engine', 'ejs')
          app.use(helmet())
          app.use(express.urlencoded({extended: true}))
          app.use(session)
          if(config.minify){
            app.use(compression())
            app.use(function(req, res, next){
              res.minifyOptions = res.minifyOptions || {}
              res.minifyOptions.js = {
                sourceMap: config.sourceMapping,
                warnings:'verbose'
              }
              next()
            })
            app.use(minify({
              cache: "./cache",
              uglifyJsModule: uglifyEs,
              errorHandler: function (errorInfo, callback) {
                console.log('minify error: ',errorInfo)
                if (errorInfo.stage === 'compile') {
                  callback(errorInfo.error, JSON.stringify(errorInfo.error))
                  return
                }
                callback(errorInfo.error, errorInfo.body)
              }
            }))
          }
          app.use(express.static('public', config.staticOptions))
          app.use('/', require('./routers/routers'))
          app.use(require('./routers/uploads'))
          app.use(function(err,req,res,next){
            console.log('general error',err)
            if(err.code == 10){
              req.session.data.page.name = 'home'
              console.log(err.message)
              res.status(500)
            }
          })
          //!!APP SETTINGS/INITIALIZE

          //INVOICE EMITTER ON
          console.log("#!!-APP- iemitter on")
          lnClient.iemitter.on('data',(invoiceData)=>{
            if(invoiceData.is_confirmed === true){
              console.log("#!!-APP- iemitter emit invoice settled!!",invoiceData)
              MDB.collection('invoices').findOneAndUpdate(
              {_id: invoiceData.id},
              {$set:{'confirmed':invoiceData.is_confirmed,'confirmed_at': invoiceData.confirmed_at}},
              {projection:{'description':1,'from': 1,'work':1,'user': 1,'session': 1,'_id':0}},
              (err,invoiceOwner)=>{
                if(err){
                  console.log('#!!-APP- error',err)
                }
                if(!!invoiceOwner.value){
                  let dataForClient = {
                    fee_mtokens: 999999999999, //is not possible to see sender fees
                    date: Date.parse(invoiceData.confirmed_at),
                    payreq: invoiceData.id,
                    amt: invoiceData.tokens,
                    description: invoiceOwner.value.description,
                    from: invoiceOwner.value.from,
                    work: invoiceOwner.value.work
                  }
                  if(invoiceOwner.value.user != 'no'){
                    MDB.collection('users').findOneAndUpdate(
                    {_id: invoiceOwner.value.user},
                    {
                      $pull:{'account.payreq':invoiceData.id},
                      $inc:{'account.balance': invoiceData.tokens},
                      $push:{'account.history':{
                        'fee_mtokens': 999999999999,
                        'date': invoiceData.confirmed_at,
                        'payreq': invoiceData.id,
                        'amt': invoiceData.tokens,
                        'description': invoiceOwner.value.description,
                        'from': invoiceOwner.value.from,
                        'work': invoiceOwner.value.work
                      }}
                    },
                    {projection:{'_id':1}},
                    (err,userId)=>{
                      if(err){console.log('#!!-APP- error',err)}else{
                        console.log(userId.value._id)
                        allSockets.forEach((sock)=>{
                          if(sock.user == userId.value._id){
                            io.sockets.to(sock._id).emit('deposit_done', dataForClient)
                          }
                        })
                      }
                    })
                  }else{
                    allSockets.forEach((sock)=>{
                      if(sock.session == invoiceOwner.value.session){
                        io.sockets.to(sock._id).emit('deposit_done', dataForClient)
                      }
                    })
                  }
                }
              })
            }else{
              console.log('#!!-APP- INVOICE EMITTER: invoice risulta generata correttamente')
            }
          })
          lnClient.iemitter.on('error',(err)=>{
            return console.log('#!!-APP- invoice emitter error!',err)
          })
          //!!INVOICE EMITTER ON

          //START HTTPS SERVER
          http2Server.listen(config.ports.https)
          console.log('#!!-APP- HTTPS Server listening on port '+config.ports.https)
          //!!START HTTPS SERVER

          //START HTTP SERVER only redirect all to HTTPS
          httpServer.listen(config.ports.http,()=>{
            console.log('#!!-APP- HTTP Server listening on port '+config.ports.http+' redirect all to https')
          })
          //!!START HTTP SERVER

          //SOCKETS MANAGEMENT
          io.use(function(socket, next){
            session(socket.request, socket.request.res, next)
          })
          io.on('error', (error) => {
            console.log('Socket error:\n',error)
          })
          io.on('connection', function (socket) { // quando un socket si connette
            //console.log('#!!-SOCKETS- un socket tenta la connessione',socket.id)
            if(!!socket.request.session){ // se socket.request.session esiste
              var hasUser
              if(!!socket.request.session.user){
                hasUser = socket.request.session.user
              }else{
                hasUser = 'no'
              }
              //console.log('#!!-SOCKETS- '+socket.id+' autenticato connesso per l\'utente:', socket.request.session.user)
              allSockets.push({_id:socket.id, session:socket.request.session.id, user: socket.request.session.user}) //inserisco il socket in allSockets
              socket.on('disconnect', function () { // quando il socket si disconnette
                var dSock = {
                  id: this.id,
                  session: this.request.session.id,
                  user: this.request.session.user
                }
                //console.log('#!!-SOCKETS- Socket disconnesso:',dSock)
                allSockets.forEach((_aSock,_asId)=>{
                  if(_aSock.session === dSock.session){
                    if(_aSock._id == dSock.id && _aSock.user == dSock.user){
                      let v = allSockets.splice(_asId,1)
                    }
                  }
                })
              })
            }else{
              console.log('#!!-SOCKETS- non aveva una sessione, lo disconnetto')
              socket.disconnect(true)
            }
          })
          //!!SOCKETS MANAGEMENT

          //INVOICES UPDATE/CLEANING CYCLE
          setInterval(function () {
            let dn = new Date()
            MDB.collection('invoices').find( { confirmed: { $ne : true }}).toArray((err,res)=>{
              if(err){return console.log('#!!-APP- error',err)}
              res.forEach((inv)=>{
                if(inv.dateE < dn){
                  MDB.collection('invoices').deleteOne({_id:inv._id},()=>{
                    MDB.collection('users').updateOne({_id:inv.user},{$pull:{'account.payreq':inv._id}},()=>{
                      console.log('#!!-APP- DB UPDATE CYCLE - eliminata zombie invoice',inv._id)
                    })
                  })
                }
              })
            })
          }, config.zombiesPurificationTime)
          //!!INVOICES UPDATING/CLEANING CYCLE

          //ON CHAIN TX UPDATING CYCLE
          setInterval(function () {
            updateOctx(()=>{})
          }, config.txCheckingTime)
          //ON CHAIN TX UPDATING CYCLE

          //CHANNEL DB SYNC CICLE
          setInterval(function () {
            updateChannels(()=>{})
          }, config.channelSyncTime)
          //!!CHANNEL DB SYNC CICLE

          //PRICE TICKER UPDATING CYCLE
          setInterval(function () {
            reqTicker((t)=>{
              return ticker = t
            })
          }, config.tickerUpdateTime)
          //!!PRICE TICKER UPDATING CYCLE

          //FEES UPDATING CYCLE
          setInterval(function () {
            reqFees((f)=>{
                return bitcoinFees = f
            })
          }, config.feesUpdateTime)
          //!!FEES UPDATING CYCLE

          //GEONAMES UPDATING CYCLE
          setInterval(function () {
            updateGeoNames()
          }, config.geonamesUpdateTime)
          //!!GEONAMES UPDATING CYCLE

        })
        //!!FIRST TIME TICKER REQUEST

      })
      //FIRST TIME FEES REQUEST

    })
    //!!START LN-CLIENT

  })
  //!!CONNECT MONGODB CLIENT NODEJS OFFICIAL DRIVER

}
//!!MAIN WRAPPER FUNCTION

//START THE APP AND MONITOR IT
setInterval(function () {
  if(!_running){
    if(rebootCounter > 0){
      console.log('RESTARTING APPLICATION FOR THE '+rebootCounter+'TIME...')
    }
    ++rebootCounter
    LnPrint()
  }
}, 2000)



// var _DATENOW = new Date()
// console.log('DATE as obj = ',_DATENOW)
// console.log('DATE as str = '+_DATENOW)
// console.log('DATE.getTime() = '+_DATENOW.getTime())
// console.log('DATE.toISOString() = '+ _DATENOW.toISOString())
// console.log('Date.parse(DATE.toISOString()) = '+Date.parse(_DATENOW.toISOString()))
// let expire = new Date(Date.now() + 300000).toISOString()
// console.log('expire = ',expire)
// console.log('valid',new Date(1552505409000))
// console.log('invalid',new Date('1552505409000'))
