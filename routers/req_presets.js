var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    LNP.MDB.collection('presets').find({}).toArray((err,presets)=>{
      if(err){ return console.log('error',err) }
      console.log('#!!-.POST/-'+req.body.type+'- cerco tutti i presets nel db e li invio al client:',presets)
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(presets)
    })
  }
}