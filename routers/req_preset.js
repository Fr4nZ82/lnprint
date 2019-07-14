var LNP = require('./utils')

module.exports = (req,res)=>{
  LNP.MDB.collection('presets').findOne({name:req.body.name},(err,preset)=>{
    if(err){
      console.log('Mongo db error',err)
      return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
    }
    console.log('#!!-.POST/-'+req.body.type+'- cerco il presets nel db e lo invio al client:',preset)
    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
    res.json(preset)
  })
}