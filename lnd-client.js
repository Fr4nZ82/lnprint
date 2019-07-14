var lnService = require('./my-ln-service'),
    config    = require('./cfg');

const lnd = lnService.lightningDaemon({
  cert: config.LND.cert,
  host: config.LND.host,
  macaroon: config.LND.macaroon
});
const lndUnlock = lnService.lightningDaemon({
  cert: config.LND.cert,
  host: config.LND.host,
  macaroon: config.LND.macaroon,
  service: 'WalletUnlocker'
});

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
    lnService.getTransactions({lnd}, (error, result) => {
      if(!!error){return cb(error)}
      return cb(null,result.transactions)
    })
  },
  genInvoice: (inv,cb)=>{
    console.log('#!!-LND- start of the genInvoice function')
    let expire = new Date(Date.now() + config.invoiceExpireTime)//.toISOString(); //EXPIRE AFTER 5 MINUTES
    lnService.createInvoice({expires_at: expire, include_address: true, lnd: lnd, tokens: inv.amt},(error, result) => {
      if(error){
        console.log("#!!-LND- genInvoice error: ",error);
        return cb(error)
      }
      result.dateE = expire
      result.description = 'toDo'
      result.from = inv.from
      result.work = 'toDo'
      return cb(null,result)
    })
  },
  decodeInvoice: (invoice,cb)=>{
    lnService.decodeInvoice({invoice: invoice, lnd: lnd},(err,result)=>{
      if(!!err){
        console.log("#!!-LND- decodeInvoice error: ",err)
      }else if(result){
        console.log('#!!-LND- decodeInvoice result:\n',result)
      }
      return cb(err,result)
    })
  },
  payInvoice: (invoice,cb)=>{
    lnService.payInvoice({fee: config.LND.maxPaymentFee, invoice: invoice, lnd: lnd},(err,result)=>{
      if(!!err){
        console.log("#!!-LND- payInvoice error: ",err)
      }else if(result){
        console.log('#!!-LND- payInvoice result:\n',result)
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
       lnClient.iemitter = lnService.subscribeToInvoices({lnd, console})
       return cb()
      });
    });
  }
}

module.exports = lnClient
