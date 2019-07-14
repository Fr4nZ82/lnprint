var LNP = require('./utils')
var router = LNP.express.Router()
var basePage = require('../views/basePage')


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
      LNP.allSockets.forEach((sock)=>{
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
  if(LNP.trouble){
    return res.json({message:{type:'alert',text:'server is shutting down because some trouble, sorry for the inconvenience'}})
  }
  //console.log('LNP.allSockets: ',LNP.allSockets)
  //console.log('REQ: ',req)
  LNP.pauselog(req, '#!!-MC/-','mc')
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
  
  if(req.session && req.session.data){
    if(req.body.type == 'page'){
      require('./page')(req,res)

    }else if(req.body.type == 'req_ticker'){
      require('./req_ticker')(req,res)

    }else if(req.body.type == 'req_bitcoinFees'){
      require('./req_bitcoinFees')(req,res)

    }else if(req.body.type == 'req_user_data') {
      require('./req_user_data')(req,res)

    }else if(req.body.type == 'register') {
      require('./register')(req,res)

    }else if(req.body.type == 'login') {
      require('./login')(req,res)

    }else if(req.body.type == 'logout') {
      require('./logout')(req,res)

    }else if(req.body.type == 'req_node_info') {
      require('./req_node_info')(req,res)

    }else if(req.body.type == 'gen_invoice') {
      require('./gen_invoice')(req,res)

    }else if(req.body.type == 'gen_newAddress') {
      require('./gen_newAddress')(req,res)

    }else if(req.body.type == 'dec_invoice') {
      require('./dec_invoice')(req,res)

    }else if(req.body.type == 'pay_invoice'){
      require('./pay_invoice')(req,res)

    }else if(req.body.type == 'payFromAccount') {
      require('./payFromAccount')(req,res)

    }else if(req.body.type == 'pay_onchain') {
      require('./pay_onchain')(req,res)

    }else if(req.body.type == 'req_users') {
      require('./req_users')(req,res)

    }else if(req.body.type == 'req_products') {
      require('./req_products')(req,res)

    }else if(req.body.type == 'remove_product') {
      require('./remove_product')(req,res)

    }else if(req.body.type == 'req_product') {
      require('./req_product')(req,res)

    }else if(req.body.type == 'req_presets') {
      require('./req_presets')(req,res)

    }else if(req.body.type == 'req_preset') {
      require('./req_preset')(req,res)

    }else if(req.body.type == 'save_preset') {
      require('./save_preset')(req,res)

    }else if(req.body.type == 'del_preset') {
      require('./del_preset')(req,res)

    }else if(req.body.type == 'req_works') {
      require('./req_works')(req,res)

    }else if(req.body.type == 'insert_product') {
      require('./insert_product')(req,res)

    }else if(req.body.type == 'update_product') {
      require('./update_product')(req,res)

    }

  }else{
    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
    res.json({message:{type:'alert',text:'No session found, please refresh'}})
  }
})

module.exports = router
