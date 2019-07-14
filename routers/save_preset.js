var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    var formData  = req.body.formData,
        presetName = req.body.name
    LNP.MDB.collection('presets').findOneAndUpdate(
      {name: presetName},
      {$set:{formData: formData}},
      {upsert:true},
      (err,uP)=>{
        if(err){
          console.log('#!!-.POST/-'+req.body.type+'- error',err)
          return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
        }
        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
        return res.json({ok:'ok',message:{type:'notify',text:'PRESET SAVED'}})
      }
    )
  }
}