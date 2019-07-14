var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.user) {
    req.session.data.page.name = 'home'
    console.log('#!!-.POST/-'+req.body.type+'- esiste quindi ne elimino il campo user')
    req.userSocketIds.forEach((sock)=>{
      console.log('disconnetto il socket ',sock)
      LNP.io.sockets.connected[sock].disconnect(true)
    })
    delete req.session.user
    if(!!req.session.admin){delete req.session.admin}
    console.log('#!!-.POST/-'+req.body.type+'- rispondo al client con:',{ok: 'ok'})
    console.log('LNP.allSockets',LNP.allSockets)
    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
    res.json({ok: 'ok'})
  }else{
    console.log('#!!-.POST/-'+req.body.type+'- NON esiste quindi ALERT')
    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
    res.json({message:{type:'alert',text:'can not log out because you are not logged in'}})
  }
}