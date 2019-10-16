var lnService = require('ln-service'),
    config    = require('./cfg');


const {lnd} = lnService.authenticatedLndGrpc({
  cert: config.LND.cert,
  macaroon: config.LND.macaroon,
  socket: config.LND.host,
});
const unauthenticatedLndGrpc = lnService.unauthenticatedLndGrpc({
  cert: config.LND.cert,
  socket: config.LND.host
});
const lndUnlock = unauthenticatedLndGrpc.lnd

var lnClient = {
  TryUnlock: (cb)=>{
    lnService.unlockWallet({lnd: lndUnlock, password: config.LND.password}, (error, result) => {
      if(!!error){
        if(error[1] == 'UnexpectedUnlockWalletErr'){
          if(error[2].details == 'Connect Failed'){
            console.log('#!!-LND- Connection failed to lnd grpc server',error);
            return cb(error)
          }else{
            console.log('#!!-LND- wallet already unlocked');
            return cb()
          }
        }else{
          console.log("#!!-LND- error: ",error)
          return cb(error)
        }
      }else{
        if(result) console.log('#!!-LND- wallet unlocked',result);
        return cb()
      }
    });
  },
  getInfo: (cb)=>{
    lnService.getWalletInfo({lnd}, (error, result) => {
      if(!!error){
        console.log("#!!-LND- getInfo error: ",error);
        return cb(error)
      }else if(result){
        console.log('#!!-LND- getinfo:\n',result);
        return cb(null,result)
      }
    });
  },
  listChannels: (cb)=>{
    lnService.getChannels({lnd}, (error, result) => {
      if(!!error){
        console.log("#!!-LND- listChannels error: ",error);
        return cb(error)
      }else if(result){
        //console.log('#!!-LND- listChannels:\n',result);
        return cb(null,result.channels)
      }
    })
  },
  listTx: (cb)=>{
    lnService.getChainTransactions({lnd}, (error, result) => {
      if(!!error){return cb(error)}
      return cb(null,result.transactions)
    })
  },
  genInvoice: (inv,cb)=>{
    console.log('#!!-LND- start of the genInvoice function')
    let expire = new Date(Date.now() + config.invoiceExpireTime)
    let desc = ''
    if(inv.description){
      desc = inv.description
    }
    lnService.createInvoice({expires_at: expire, description: desc, lnd: lnd, tokens: inv.amt},(error, result) => {
      if(error){
        console.log("#!!-LND- genInvoice error: ",error);
        return cb(error)
      }
      result.dateE = expire
      result.from = inv.from
      result.work = 'toDo'
      return cb(null,result)
    })
  },
  decodeInvoice: (invoice,cb)=>{
    lnService.decodePaymentRequest({request: invoice, lnd: lnd},(err,result)=>{
      if(!!err){
        console.log("#!!-LND- decodeInvoice error: ",err)
      }else if(result){
        console.log('#!!-LND- decodeInvoice result:\n',result)
      }
      return cb(err,result)
    })
  },
  payInvoice: (invoice,cb)=>{
    lnService.payViaPaymentRequest({max_fee: config.LND.maxPaymentFee, request: invoice, lnd: lnd},(err,result)=>{
      if(!!err){
        console.log("#!!-LND- payInvoice error: ",err)
      }else if(result){
        console.log('#!!-LND- payInvoice result:\n',result)
        result.tokens=Math.round(result.mtokens / 1000)
      }
      return cb(err,result)
    })
  },
  newAddress: (cb)=>{
    lnService.createAddress({lnd},(err,result)=>{
      if(err){
        console.log("#!!-LND- createAddress error: ",err)
        return cb(err)
      }
      console.log('#!!-LND- createAddress result:\n',result)
      result.description = 'toDo'
      result.work = 'toDo'
      return cb(null,result)
    })
  },
  sendCoins: (address,tokens,fees,cb)=>{
    lnService.sendToChainAddress({address, lnd, tokens, fees}, (err,txid)=>{
      if(!!err){
        console.log("#!!-LND- outgoing on chain payment error: ",err)
      }else if(row){
        console.log("#!!-LND- outgoing on chain payment done: ",txid)
      }
      return cb(err,txid)
    })
  },
  start: (cb)=>{
    lnClient.TryUnlock((err)=>{
      if(!!err){
        return cb(err)
      }
      lnClient.getInfo((err,nodeinfo)=>{
       if(!!err){
         return cb(err)
       }
       lnClient.nodeInfo = nodeinfo
       lnClient.iemitter = lnService.subscribeToInvoices({lnd})
       return cb()
      });
    });
  }
}

module.exports = lnClient
