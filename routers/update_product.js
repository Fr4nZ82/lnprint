var LNP = require('./utils')

module.exports = (req,res)=>{
  if(req.session.admin === true){
    req.session.data.uploading = req.body.nPhotos
    console.log('#!!-.POST/-'+req.body.type+'- è un admin!')
    var productData = req.body.productData
    var productId = new LNP.mongo.ObjectID(productData._id)
    LNP.MDB.collection('products').findOneAndDelete({_id: productId},(err,removedProduct)=>{
      if(err){
        console.log('Mongo db error',err)
        return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
      }
      if(removedProduct.value.photos.length > 0){
        //TODO remove old photos files
      }
      delete productData._id
      productData.photos = []
      productData.works = []
      if(!productData.readyToSell > 0){
        productData.readyToSell = 0
      }
      productData.createdAt = removedProduct.createdAt
      productData.docUpdatedAt = new Date()
      LNP.MDB.collection('products').insertOne(productData, (err,result)=>{
        if(err){
          console.log('Mongo db error',err)
          return res.json({message:{type:'alert',text:'server error, product deleted but not updated!'}})
        }
        console.log('#!!-.POST/-'+req.body.type+'- Inserimento dati nel db effettuato: ', result.ops[0])
        console.log('#!!-.POST/-'+req.body.type+'- numero foto da caricare: ',req.session.data.uploading)
        LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
        res.json({productId:result.ops[0]._id})
      })
    })
  }
}