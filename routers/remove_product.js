var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    var productId = new LNP.mongo.ObjectID(req.body.productId)
    LNP.MDB.collection('products').deleteOne({ _id : productId},(err,result)=>{
      if(err){
        console.log('Mongo db error',err)
        return res.json({message:{type:'alert',text:'can not inesrt product, database error'}})
      }else{
        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
        return res.json({ok:'ok'})
      }
    })
  }
}