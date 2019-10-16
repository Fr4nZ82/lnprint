LnPrint.admin.print = {
  overviewCard: (card,cardText)=>{
    var icon, clickon, title
    if(card == 'mes'){
      title = 'Messages'
      icon = 'fas fa-fw fa-envelope'
      clickon = 'onclick="LnPrint.admin.draw.messages(LnPrint.user)"'
    }else if(card == 'fou'){
      title = 'Balance'
      icon = 'fab fa-fw fa-btc'
      clickon = 'onclick="LnPrint.admin.draw.founds(LnPrint.user)"'
    }else if(card == 'wor'){
      title = 'Works'
      icon = 'fas fa-fw fa-print'
      clickon = 'onclick="LnPrint.admin.draw.works(LnPrint.user)"'
    }else if(card == 'shi'){
      title = 'Shipments'
      icon = 'fas fa-fw fa-shopping-cart'
      clickon = 'onclick="LnPrint.admin.draw.shipments(LnPrint.user)"'
    }else{
      title = ''
      icon = ''
      clickon = ''
    }
    return `
      <div class="card text-white `+card+` o-hidden h-100">
        <div class="card-body">
          <h5 class="card-title">`+title+`</h5>
          <div class="card-body-icon">
            <i class="`+icon+`"></i>
          </div>
          <div class="mr-5">`+cardText+`</div>
        </div>
        <a class="card-footer text-white clearfix small z-1" href="javascript:void(0)" `+clickon+`>
          <span class="float-left">View Details</span>
          <span class="float-right">
            <i class="fas fa-angle-right"></i>
          </span>
        </a>
      </div>
    `
  },
  channelsTable: (founds)=>{
    let tableIntestation = `
      <div class="overthetable">
        <div class="tabletitlediv">
        Channels
        </div>
        <div class="uptableborder">
        <button class="btn btn-sm btn-primary" onclick="LnPrint.modal.new({from:'channelsTable',name:'nodeInfo'})">Open a channel</button>
        </div>
      </div>
      <table id="channelstable" class="mytable">
        <thead>
          <tr>
            <td>Node Pubkey</td>
            <td>Channel ID</td>
            <td>Balance</td>
            <td></td>
          </tr>
        </thead>
    `
    if(founds.userRemotePubkeys.length < 1){
      return tableIntestation + `
          <div class="channelsTableCover">
            If you have your node direct connected to lightningprintings, to show channels, needs a little withdraw.<br>
            <a href="javascript:(void(0))" onclick="LnPrint.modal.new({from:'channelsTable',name:'withdraw'})"  class="linkToWithdraw">
              Do it
            </a>
          </div>
          <tbody id="chanTabBody">
            <tr>
              <td class="w-b">03f9ceb115a119594b4688ceed35feb80f33a3dd0f5cf688a7493c1a7217633931</td>
              <td class="w-b">588497106122047489</td>
              <td>0.12345678</br>0.12345678</td>
              <td><button id="channelButton" class="btn btn-sm btn-primary">i</button></td>
            </tr>
          </tbody>
        </table>
      `
    }else{
      let tableBody = `<tbody>`
      founds.userRemotePubkeys.forEach((uRP,index)=>{
        uRP.channels.forEach((chan,index)=>{
          tableBody += `
            <tr>
              <td class="w-b" rowspan="2">`+uRP._id+`</td>
              <td class="w-b" rowspan="2">`+chan._id+`</td>
              <td><span class="remotebalance">`+chan.remote_balance+`</span>
              <td rowspan="2"><button id="channelButton" class="btn btn-sm btn-primary">i</button></td>
            </tr>
            <tr>
              <td><span class="localbalance">`+chan.local_balance+`</span></td>
            </tr>
          `
        })
      })
      tableBody += `</tbody></table>`

      return tableIntestation + tableBody
    }
  },

  //TRANSACTION HISTORY TABLE
  nodeTransTable: (founds)=>{
    let tableIntestation = `
      <div class="overthetable">
        <div class="tabletitlediv">
        Transaction History
        </div>
        <div class="uptableborder">
        </div>
      </div>
      <table id="transtable" class="mytable">
        <thead>
          <tr>
            <td>date</td>
            <td>type</td>
            <td>amount</td>
          </tr>
        </thead>
    `
    if(founds.history.length > 0){
      let tableBody = `<tbody>`
      let trColor, dt
      founds.history.forEach((tx)=>{
        if(         tx.from == 'deposit'    ){    trColor = 'trcolorgreen'  }
        else if(    tx.from == 'withdraw'   ){    trColor = 'trcolorred'    }
        else if(    tx.from == 'payment'    ){    trColor = 'trcolorgrey'   }
        else{trColor = ''}
        dt = new Date(tx.date)
        tableBody += `
          <tr class="`+trColor+`">
            <td>`+dt.toUTCString()+`</td>
            <td>`+tx.from+`</td>
            <td>`+tx.amt+`</td>
          </tr>
        `
      })
      tableBody += `</tbody>`
      tableBody += `</table>`
      return tableIntestation + tableBody
    }else{
      return tableIntestation + `</table>`
    }
  },

  //PRODUCTS TABLE
  productsTable: (products)=>{
    let tableIntestation = `
      <div class="overthetable">
        <div class="tabletitlediv">
        Products
        </div>
        <div class="uptableborder">
          <button class="btn btn-sm btn-primary" onclick="LnPrint.admin.draw.addProduct()">Add Product</button>
          <button id="editPresetsButton" class="btn btn-sm btn-primary" onclick="LnPrint.admin.draw.editPresets()">edit presets</button>
        </div>
      </div>
      <table id="producttable" class="mytable">
        <thead>
          <tr>
            <td>photo</td>
            <td>name</td>
            <td>avaible</td>
            <td>works</td>
            <td>selled</td>
            <td>edit</td>
          </tr>
        </thead>
    `
    if(products.length > 0){
      let tableBody = `<tbody>`
      let trColor, dt
      products.forEach((p,i)=>{
        if(         p.listable == false      ){    trColor = 'trcolorgrey'  }
        else if(    p.listable == true      ){    trColor = 'trcolorgreen'    }
        else{trColor = ''}

        tableBody += `
          <tr class="`+trColor+`">
            <td><img src="`+(()=>{
                              if(p.mainPhoto == 'no'){
                                return 'img/nophoto.jpg'
                              }else{
                                return 'data:image/jpeg;base64,' + p.mainPhoto
                              }
                            })() +`" style='height:40px;width:40px;'></img></td>
            <td>`+p.name+`</td>
            <td>`+p.readyToSell+`</td>
            <td>`+p.works.length+`</td>
            <td>`+p.selled+`</td>
            <td>
              <button id="editProductButton" class="btn btn-sm btn-primary" onclick="LnPrint.req.product('`+p.id+`',true,(prod)=>{LnPrint.admin.draw.addProduct(prod)})">edit</button>
              <button id="removeProductButton" class="btn btn-sm btn-danger" onclick="LnPrint.admin.req.removeProduct('`+p.id+`')">remove</button>
            </td>
          </tr>
        `
      })
      tableBody += `</tbody>`
      tableBody += `</table>`
      return tableIntestation + tableBody
    }else{
      return tableIntestation + `</table>`
    }
  },
  addProductForm: (presets,edit)=>{
    return `
      <div class="prendered-div" id="rendered-form">
        <div class="pform-group">
          <label for="pName">Product name
            <span class="pform-required">*</span>
          </label>

          <input type="text" class="pform-control" name="pName" id="pName" required="required" aria-required="true" `+
          (()=>{
            if(edit){
              return 'value="'+edit.name+'"'
            }
          })()+`>

        </div>
        <div class="pform-group">
          <div>
            <div>

              <input name="pListable" id="pListable" value="check" type="checkbox" `+
              (()=>{
                if(edit && edit.listable == 'false'){
                  return ''
                }
                return 'checked="checked"'
              })()+`>

              <label for="pListable-0">Listable
                <span class="ptooltip-element" tooltip="de-flag the checkbox to hide this product to the users">?</span>
              </label>
            </div>
          </div>
        </div>
        <div class="pform-group">
          <label for="pDisp">Available
            <span class="ptooltip-element" tooltip="If this is a ready-made products insert how many piece are avaible to sell">?</span>
          </label>

          <input type="number" placeholder="0" class="pform-control" name="pDisp" min="0" step="1" id="pDisp"
          title="If this is a ready-made products insert how many piece are avaible to sell"
          `+(()=>{
            if(edit){
              return 'value="'+edit.readyToSell+'"'
            }
            return 'value="0"'
          })()+`>

        </div>
        <div class="pform-group">
          <label for="currencyselect">Select favorite currency (all currency will be converted to USD when saved)
          </label>

          <select class="pform-control" name="currencyselect" id="currencyselect">
            <option value="USD" id="formCurrency-0">USD</option>
            <option value="EUR" id="formCurrency-1">EUR</option>
            <option value="CNY" id="formCurrency-2">CNY</option>
          </select>

          <hr class="pricesseparator">
          <label for="pDraftPrice">Draft Price
            <span class="convertedprice" id="dconvertedprice0">€ 0</span>
            <span class="convertedprice" id="dconvertedprice1">Y 0</span>
            <span class="convertedprice" id="dconvertedprice2">B 0</span>
          </label>

          <input type="number" placeholder="0" class="pform-control" name="pDraftPrice" min="0" step="1" id="pDraftPrice" title="Draft Price" `+
          (()=>{
            if(edit){
              return 'value="'+edit.draftPrice+'"'
            }
          })()
          +`>
          <input type="hidden" id="dPriceUSD">

          <hr class="pricesseparator">
          <label for="pWorkPrice">Work Price
            <span class="convertedprice" id="wconvertedprice0">€ 0</span>
            <span class="convertedprice" id="wconvertedprice1">Y 0</span>
            <span class="convertedprice" id="wconvertedprice2">B 0</span>
          </label>

          <input type="number" placeholder="0" class="pform-control pNeededPrice" name="pWorkPrice" min="0" step="1" id="pWorkPrice" title="Work Price" `+
          (()=>{
            if(edit){
              return 'value="'+edit.workPrice+'"'
            }
          })()
          +`>
          <input type="hidden" id="wPriceUSD" value="0">

          <hr class="pricesseparator">
          <label for="pCopiesPrice">Copies Price
            <span class="convertedprice" id="cconvertedprice0">€ 0</span>
            <span class="convertedprice" id="cconvertedprice1">Y 0</span>
            <span class="convertedprice" id="cconvertedprice2">B 0</span>
          </label>

          <input type="number" placeholder="0" class="pform-control pNeededPrice" name="pCopiesPrice" min="0" step="1" id="pCopiesPrice" title="Copies Price" `+
          (()=>{
            if(edit){
              return 'value="'+edit.copiesPrice+'"'
            }
          })()
          +`>
          <input type="hidden" id="cPriceUSD">

        </div>
        <div class="pform-group">
          <label for="pWTime">work time
            <span class="ptooltip-element" tooltip="If this is a custom product insert the estimated work time in minutes">?</span>
          </label>

          <input type="number" placeholder="0" class="pform-control" name="pWTime" min="0" step="1" id="pWTime"
          title="If this is a custom product insert the estimated work time in minutes"
          `+(()=>{
            if(edit){
              return 'value="'+edit.workTime+'"'
            }else{
              return 'value="0"'
            }
          })()+`>

          <label for="pDTime">draft time
            <span class="ptooltip-element" tooltip="If this is a custom product insert the estimated draft time in minutes">?</span>
          </label>

          <input type="number" placeholder="0" class="pform-control" name="pDTime" min="0" step="1" id="pDTime"
          title="If this is a custom product insert the estimated draft time in minutes"
          `+(()=>{
            if(edit){
              return 'value="'+edit.draftTime+'"'
            }else{
              return 'value="0"'
            }
          })()+`>

          <label for="pCTime">copy time
            <span class="ptooltip-element" tooltip="If this is a custom product insert the estimated time in second for each copy">?</span>
          </label>

          <input type="number" placeholder="0" class="pform-control" name="pCTime" min="0" step="1" id="pCTime"
          title="If this is a custom product insert the estimated time in second for each copy"
          `+(()=>{
            if(edit){
              return 'value="'+edit.copiesTime+'"'
            }else{
              return 'value="0"'
            }
          })()+`>

        </div>

        <div class="pform-group">
          <label for="productTags">Tags
            <span class="pform-required">*</span>
            <span class="ptooltip-element" tooltip="Insert tags separed by comma">?</span>
          </label>

          <textarea type="textarea" class="pform-control pform-textarea" name="productTags" id="productTags" title="Insert tags separed by comma" pattern="^([a-z0-9]+(?:,[a-z0-9]+)*)$">`+
          (()=>{
            if(edit){
              return edit.tags
            }
            return ''
          })()
          +`</textarea>

        </div>
        <div class="pform-group">
          <label for="formPresets">Form preset

            <button id="editPresetsButton" class="btn btn-sm btn-primary">edit presets</button>

          </label>

          <select class="pform-control" name="formPresets" id="formPresets"></select>

        </div>
        <div class="pform-group">
          <label for="pDescription">Description</label>
            <span class="pform-required">*</span>

          <textarea type="textarea" class="pform-control pform-textarea" name="pDescription" id="pDescription">`+
          (()=>{
            if(edit){
              return edit.description
            }
            return ''
          })()
          +`</textarea>

        </div>
        <div class="pform-group" id="pShipments">
          <label for="field-pShipments" id="pShipmentsLabel">Shipments availe
            <span class="pform-required">*</span>
          </label>

          <div>
            <div>
              <input class="pShipmentsCB" name="pShipmentsn" id="pShipments-0" value="A" type="checkbox" `+
              (()=>{
                if(edit){
                  if(edit.shipmentType.includes('A')){
                    return 'checked="checked'
                  }else{
                    return ''
                  }
                }
                return 'checked="checked"'
              })()+`>
              <label for="pShipments-0">Option 1</label>
            </div>
            <div>
              <input class="pShipmentsCB" name="pShipmentsn" id="pShipments-1" value="B" type="checkbox" `+
              (()=>{
                if(edit){
                  if(edit.shipmentType.includes('B')){
                    return 'checked="checked'
                  }
                }
                return ''
              })()+`>
              <label for="pShipments-1">Option 2</label>
            </div>
            <div>
              <input class="pShipmentsCB" name="pShipmentsn" id="pShipments-2" value="C" type="checkbox" `+
              (()=>{
                if(edit){
                  if(edit.shipmentType.includes('C')){
                    return 'checked="checked'
                  }
                }
                return ''
              })()+`>
              <label for="pShipments-2">Option 3</label>
            </div>
          </div>

        </div>

        <div class="pform-group" id="pMainPhotoDiv">

          <label for="pPhotos">Upload photos
            <span class="ptooltip-element" tooltip="You can upload multiple files">?</span>
          </label>

          <input id="thefiles" type="file" name="pphotos" accept=".jpg, .png, image/jpeg, image/png" multiple>

          <label for="pMainPhoto">Main photo
            <span class="ptooltip-element" tooltip="select product main photo">?</span>
          </label>

          <select class="pform-control" name="pMainPhoto" id="pMainPhoto">
            <option selected value="pMainPhotoNotSelected" id="pMainPhotoNotSelected">-- select a photo --</option>
          </select>

        </div>

        <div class="pform-group">
          <label for="pViedo">Video (link)
            <span class="ptooltip-element" tooltip="Optional insert a link to a video">?</span>
          </label>

          <input type="text" class="pform-control" name="pViedo" id="pViedo" title="Optional insert a link to a video" `+
          (()=>{
            if(edit && edit.video != ''){
              return 'value="'+edit.video+'"'
            }
          })()+`>

        </div>
        <div class="pform-group">
          <label for="pExtLink">External link
            <span class="ptooltip-element" tooltip="Optional insert an external link to product specifics">?</span>
          </label>

          <input type="text" class="pform-control" name="pExtLink" id="pExtLink" title="Optional insert an external link to product specifics" `+
          (()=>{
            if(edit && edit.extLink != ''){
              return 'value="'+edit.extLink+'"'
            }
          })()+`>

        </div>
        <div class="pform-group">
          <span class="pform-required">* = required element</span>
        </div>
        <div class="pform-group">
          <button id="addProductCancelButton" class="btn btn-sm btn-danger" onclick="LnPrint.goBackward(false)">Cancel</button>
          <button disabled id="addProductSubmitButton" class="btn btn-sm btn-primary" onclick="LnPrint.admin.post.formSubmit(()=>{})">Submit</button>
        </div>
      </div>
    `
  },
  presetsList: (presets)=>{
    return `
      <select class="ep-form-control presetsCommands" name="presetselect" id="presetselect">
    ` + (()=>{
          let htmlString = '<option disabled selected id="formPresetNotSelected">-- select a preset --</option>'
          presets.forEach((p,i)=>{
            let id = p.name.replace(/\s+/g, "-")
            htmlString += '<option value="'+p.name+'" id="preset_'+id+'">'+p.name+'</option>'
          })
          return htmlString
        })() + `
      </select>
    `
  },
  presetsCommands: ()=>{
    return `
      <button class="btn btn-primary presetsCommands" id="newPresetBtn">new</button>
      <button class="btn btn-success presetsCommands savepresetbtn" id="savepresetbtn1" disabled=true>save</button>
      <button class="btn btn-danger presetsCommands" id="delPresetBtn" disabled=true>delete</button>
      <button class="btn btn-secondary presetsCommands" id="closeEditPresetBtn">close</button>
    `
  },
  presetBuilder: ()=>{
    return `
      <div class="buildWrap"></div>
      <div class="hideRenderWrap">
        <div class="renderWrap"></div>
        <div>
          <button id="editformbtn" class="btn btn-secondary">close</button>
          <button id="savepresetbtn2" class="savepresetbtn btn btn-success">save Preset</button>
        </div>
      </div>
    `
  },
  presetsCommands2: ()=>{
    return `
        <button class="btn btn-danger" id="resetPresetBtn">reset</button>
        <button class="btn btn-success" id="previewPresetBtn">preview</button>
    `
  }
}
