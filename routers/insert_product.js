var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){ 
    req.session.data.uploading = req.body.nPhotos
    var productData = req.body.productData
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    console.log('#!!-.POST/-'+req.body.type+'- controllo che non ci sia un altro prodotto con lo stesso nome')
    LNP.MDB.collection('products').findOne({name: productData.name},(err,sameName)=>{
      if(err){
        console.log('Mongo db error',err)
        return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
      }
      if(sameName){
        console.log('#!!-.POST/-'+req.body.type+'- Esiste già un prodotto con lo stesso nome!:',sameName)
        return res.json({message:{type:'alert',text: 'duplicated product name'}})
      }else{
        var dateNow = new Date()
        productData.photos = []
        productData.works = []
        if(!productData.readyToSell > 0){
          productData.readyToSell = 0
        }
        productData.createdAt = dateNow
        productData.docUpdatedAt = dateNow
        LNP.MDB.collection('products').insertOne(productData, (err,result)=>{
          if(err){
            console.log('Mongo db error',err)
            return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
          }
          console.log('#!!-.POST/-'+req.body.type+'- Inserimento dati nel db effettuato: ', result.ops[0])
          console.log('#!!-.POST/-'+req.body.type+'- numero foto da caricare: ',req.session.data.uploading)
          LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
          res.json({productId:result.ops[0]._id})
        })
      }
    })
  }
}