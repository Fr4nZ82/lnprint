var LNP = require('./utils')

module.exports = (req,res)=>{
  LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
    return res.json({
      uri: LNP.lnClient.nodeInfo.uri,
      alias: LNP.lnClient.nodeInfo.alias
    })
}