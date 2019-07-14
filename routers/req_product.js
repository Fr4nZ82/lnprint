var LNP = require('./utils')

module.exports = (req,res)=>{
  var productId = new LNP.mongo.ObjectID(req.body.productId)
  LNP.MDB.collection('products').findOne({ _id : productId},(err,result)=>{
    if(err){
      console.log('Mongo db error',err)
      return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
    }
    if(req.body.photo == 'true'){
      var photoBuffer, fileData
      result.photos.forEach((photo,i)=>{
        try{
          photoBuffer = LNP.fs.readFileSync("./uploads/pphotos/" + photo.fileId)
          fileData = photoBuffer.toString('base64')
        }catch(errr){
          if(!errr.toString().includes("ENOENT")){
            console.log('read file error',errr)
          }
          fileData = 'no'
        }
        //console.log('fileData',fileData)
        result.photos[i].fileData = fileData
      })
    }
    var mpb, mp
    try{
      mpb = LNP.fs.readFileSync("./uploads/pphotos/thumbs/" + result.mainPhoto)
      mp = mpb.toString('base64')
    }catch(errr){
      if(!errr.toString().includes("ENOENT")){
        console.log('read file error',errr)
      }
      mp = 'no'
    }

    if(req.session.data.page.name == 'admin'){
      var product = result
    }else{
      var product = {
        id: result._id,
        copiesPrice: result.copiesPrice,
        copiesTime: result.copiesTime,
        description: result.description,
        draftPrice: result.draftPrice,
        draftTime: result.draftTime,
        extLink: result.extLink,
        mainPhoto: mp,
        name: result.name,
        photos: result.photos,
        preset: result.preset,
        readyToSell: result.readyToSell,
        shipmentType: result.shipmentType,
        tags: result.tags,
        video: result.video,
        workPrice: result.workPrice,
        workTime: result.workTime,
        //works: result.works, //toDo map only user work
      }
    }
    LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
    res.json(product)
  })
}