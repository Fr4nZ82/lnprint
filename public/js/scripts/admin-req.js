LnPrint.admin.req = {
  users:()=>{

  },
  insertProduct: (pData,nPhotos,cb)=>{
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'insert_product',
        productData: pData,
        nPhotos: nPhotos
      },
      success: function(response){
        cb(response.productId)
      }
    })
  },
  removeProduct: (pId,cb)=>{
    cb = cb || noop
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'remove_product',
        productId: pId
      },
      success: function(response){
        LnPrint.admin.draw.products()
      }
    })
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
