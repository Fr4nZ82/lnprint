LnPrint.admin.req = {
  users:()=>{

  },
  insertProduct: (pData,nPhotos,cb)=>{
    LnPrint.post(
      {type: 'insert_product',productData: pData,nPhotos: nPhotos},
      {
        ifYes:(res)=>{
          cb(res.productId)
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
   },
  removeProduct: (pId)=>{
    LnPrint.post(
      {type: 'remove_product',productId: pId},
      {
        ifYes:(res)=>{LnPrint.admin.draw.products()}
      }
    )
  },
  updateProduct: (pData,nPhotos,cb)=>{
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'update_product',
        productData: pData,
        nPhotos: nPhotos
      },
      success: function(response){
        cb(response.productId)
      }
    })
  },
  delPreset:(presetName,cb)=>{
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'del_preset',
        name:presetName
      },
      success: (res)=>{
        cb(res)
      }
    })
  },
  savePreset:(presetName,formData,cb)=>{
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'save_preset',
        formData:formData,
        name:presetName
      },
      success: (res)=>{
        LnPrint.notifyMsg(res.notifyMsg,()=>{
          cb()
        })
      }
    })
  },
  presets: (cb)=>{
    $.ajax({
      type: 'POST',
      url: '/',
      data: {type: 'req_presets'},
      success: function(res){
        cb(res)
      }
    });
  },
  works: ()=>{

  },
  lnd: {
    channels: ()=>{

    },
    invoices: ()=>{

    },
    balances: ()=>{

    },
    fwdingHistory: ()=>{

    },
    feeReport: ()=>{

    }//ETC....
  },
  messages: ()=>{

  },
  shipment:()=>{

  }
}
