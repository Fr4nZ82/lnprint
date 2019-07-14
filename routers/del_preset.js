var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    var presetName = req.body.name
    LNP.MDB.collection('presets').findOneAndDelete({name: presetName},(err,rP)=>{
      if(err){return console.log('#!!-.POST/-'+req.body.type+'- error',err)}
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      return res.json({ok:'ok',message:{type:'notify',text:'PRESET DELETED'}})
    })
  }
}