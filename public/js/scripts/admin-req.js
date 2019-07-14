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
        ifYes:(res)=>{
          LnPrint.admin.draw.products()
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  updateProduct: (pData,nPhotos,cb)=>{
    LnPrint.post(
      {type:'update_product', productData: pData, nPhotos: nPhotos},
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
  delPreset:(presetName,cb)=>{
    LnPrint.post(
      {type:'del_preset', name: presetName},
      {
        ifYes:(res)=>{
          cb(res)
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  savePreset:(presetName,formData,cb)=>{
    LnPrint.post(
      {type:'save_preset', formData: formData, name: presetName},
      {
        ifYes:(res)=>{
          cb(res)
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  presets: (cb)=>{
    LnPrint.post(
      {type:'req_presets'},
      {
        ifYes:(res)=>{
          cb(res)
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
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
