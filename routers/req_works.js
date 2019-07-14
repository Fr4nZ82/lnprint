var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    LNP.MDB.collection('works').find({}).toArray((err,works)=>{
      if(err){ return console.log('error',err) }
      console.log('#!!-.POST/-'+req.body.type+'- cerco tutti i works nel db e li invio al client:',works)
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(works)
    })
  }
}