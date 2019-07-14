var LNP = require('./utils')

module.exports = (req,res)=>{
  LNP.MDB.collection('products').find({}).toArray((err,products)=>{
    if(err){
      console.log('Mongo db error',err)
      return res.json({message:{type:'alert',text:'server error, please refresh and try later'}})
    }
    var pPlusP = [], mp = '', p, ii, hole = 0
    //console.log('A',products)
    if(products.length){
      for( ii=0 ; ii < products.length ; ii++){
        p = products[ii]
        if(p.listable != 'true' && req.session.data.page.name != 'admin'){
          hole++
          continue
        }
        pPlusP.push({
          id: p._id,
          name: p.name,
          readyToSell: p.readyToSell,
          prices: {c:p.copiesPrice,w:p.workPrice,d:p.draftPrice}
        })

        if(req.session.admin === true){
          pPlusP[pPlusP.length - 1].works = p.works
          pPlusP[pPlusP.length - 1].selled = p.selled
        }
        try{
          mpb = LNP.fs.readFileSync("./uploads/pphotos/thumbs/" + p.mainPhoto)
          mp = mpb.toString('base64')
        }catch(errr){
          if(!errr.toString().includes("ENOENT")){
            console.log('read file error',errr)
          }
          mp = 'no'
        }
        pPlusP[ii - hole].mainPhoto = mp
      }
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(pPlusP)
    }else{
      LNP.pauselog(req, '#!!-.POST/-'+req.body.type)
      res.json(pPlusP)
    }
  })
}