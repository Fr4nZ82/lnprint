var LNP = require('./utils')

module.exports = (req,res)=>{
  console.log('#!!-.POST/-'+req.body.type+'- controllo se user esiste')
  let clientConf = {
    maxInvoiceAmt: LNP.config.maxInvoiceAmt,
    productImgWidth: LNP.config.productImgWidth
  }
  LNP.ifUser(req,res,
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
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json({page:req.session.data.page,user: actualUser, conf: clientConf})
    },
    ()=>{
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json({page:req.session.data.page,user:{_id: ''},conf: clientConf})
    }
  )
}