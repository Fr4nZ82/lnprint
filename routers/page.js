var LNP = require('./utils')

module.exports = (req,res)=>{
  console.log('#!!-.POST/-'+req.body.type+'- assegno il req.body.name (nome pagina) alla sessione')
  req.session.data.page.name = req.body.name
  console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con questi dati: ',req.session.data)
  LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
  res.json(req.session.data)
}
