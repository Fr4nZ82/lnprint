var LNP = require('../app.js'),
    MDB = LNP.MDB

module.exports = function(req, res, next) {
  // Implement the middleware function based on the options object
  var uploadProductsFiles = LNP.multer({ dest: LNP.config.productsFilesPath })
  uploadProductsFiles.uploading = {}
  LNP.app.post('/pphotos', uploadProductsFiles.single('pphotos'), function (req, res, next) {
    if(req.session.admin===true && !!req.session.data.uploading){
      console.log('upload start, req.file: ', req.file)
      LNP.sharp(req.file.path).resize(LNP.config.thunbSize, LNP.config.thunbSize).toFile('./' + req.file.destination + '/thumbs/' + req.file.filename ,(err, info)=>{
        if (err) {console.log(err)}
        console.log('info: ',info)
      })
      console.log('#!!-APP- numero file totali:',req.session.data.uploading)
      if(req.body.action == 'productPhotoUpload'){
        console.log('body:', req.body)
        var fileId    = req.file.filename,
            fileName  = req.file.originalname,
            productId = new LNP.mongo.ObjectID(req.body.productId)
        MDB.collection('products').findOne({_id: productId},(err,product)=>{
          if(err){console.log('#!!-APP- errore inserimento file name nel db products',err)}
          //console.log('product',product)
          let photosId = product.photos.map((x)=>{return x.fileId})
          if(!photosId.includes(fileId)){
            MDB.collection('products').updateOne(
              {_id: productId},
              {
                $push: { 'photos': { 'fileId':fileId, 'fileName':fileName }},
                $set: { docUpdatedAt: new Date() }
              },
              (err,updated)=>{
                if(err){console.log('#!!-APP- errore inserimento file name nel db products',err)}
                if(fileName == product.mainPhoto){
                  MDB.collection('products').updateOne(
                    {_id: productId},
                    {
                      $set:
                      {
                        'mainPhoto':fileId,
                        docUpdatedAt: new Date()
                      }
                    },
                    (err)=>{
                      if(err){return console.log('MDB ERROR:',err)}
                    }
                  )
                }
                if(!!uploadProductsFiles.uploading[req.session.user]){
                  uploadProductsFiles.uploading[req.session.user]--
                }else{
                  uploadProductsFiles.uploading[req.session.user] = req.session.data.uploading
                }
                //console.log('#!!-APP- product con id '+req.body.productId+' aggiornato con questo file: '+req.file.filename)
                //console.log('#!!-APP- file rimanenti:',uploadProductsFiles.uploading[req.session.user])
                var fileNumber = uploadProductsFiles.uploading[req.session.user]
                if(uploadProductsFiles.uploading[req.session.user] == 1){
                  delete uploadProductsFiles.uploading[req.session.user]
                  delete req.session.uploading
                }
                res.json({success:true,fileNumber:fileNumber})
              }
            )
          }
        })
      }else{
        res.redirect('/')
      }
    }else{
      res.redirect('/')
    }
  })
  LNP.app.post(
    '/presetForm',
    LNP.formidable({
      uploadDir: __dirname + '../../uploads/userUploads',
      multiples: true,
      keepExtensions: true
    }),
    (req,res)=>{
      console.log('req.files',req.files)
      console.log('req.fields',req.fields)
    }
  )
  next()
}
