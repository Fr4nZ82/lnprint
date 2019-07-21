LnPrint.dashboard.print = {
  overviewCard: (card,cardText)=>{
    var icon, clickon, title;
    if(card == 'mes'){
      title = 'Messages';
      icon = 'fas fa-fw fa-envelope';
      clickon = 'onclick="LnPrint.dashboard.draw.messages(LnPrint.user);"'
    }else if(card == 'fou'){
      title = 'Balance';
      icon = 'fab fa-fw fa-btc';
      clickon = 'onclick="LnPrint.dashboard.draw.founds(LnPrint.user);"';
    }else if(card == 'wor'){
      title = 'Works';
      icon = 'fas fa-fw fa-print';
      clickon = 'onclick="LnPrint.dashboard.draw.works(LnPrint.user);"';
    }else if(card == 'shi'){
      title = 'Cart/Shipments';
      icon = 'fas fa-fw fa-shopping-cart';
      clickon = 'onclick="LnPrint.dashboard.draw.shipments(LnPrint.user);"';
    }else{
      title = '';
      icon = '';
      clickon = '';
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
        <a class="card-footer text-white clearfix small z-1" href="javascript:void(0);" `+clickon+`>
          <span class="float-left">View Details</span>
          <span class="float-right">
            <i class="fas fa-angle-right"></i>
          </span>
        </a>
      </div>
    `
  },
  balanceCard: (founds)=>{
    let noFound = `NOT ENOUGH FOUNDS TO WITHDRAW!`
    return `
      <div id="balancecard" class="o-hidden">
        <div class="card-body" style="padding-bottom: 0px;text-align: center;">
          <h5 id="balancecard-title" class="card-title"><span id="btcsymbol">₿</span>alance</h5>
          <div id="balancetext">
            `+founds.balance+` Sat
          </div>
        </div>
        <div class="row card-buttons">
          <div class="col-6" style="padding-right: 0px;padding-left: 0px;">
            <button
              id="depositButton" class="btn btn-primary btn-block"
              onclick="LnPrint.req.genAddress('balanceCard')">
                onchain</br>
                deposit
            </button>
          </div>
          <div class="col-6" style="padding-left: 0px;padding-right: 0px;">
            <button
              id="withdrawButton" class="btn btn-danger btn-block"
              onclick="if(LnPrint.user.account.balance > 0){LnPrint.modal.new({from:'balanceCard',name:'ocWithdraw'})}else{LnPrint.notifyMsg({type:'alert',text:'`+noFound+`'})}">
                onchain</br>
                withdraw
            </button>
          </div>
        </div>
        <div class="row card-buttons">
          <div class="col-6" style="padding-right: 0px;padding-left: 0px;">
            <button
              id="newInvoiceButton" class="btn btn-primary btn-block"
              onclick="LnPrint.modal.new({from:'balanceCard',name:'deposit'})">
                new</br>
                invoice
            </button>
          </div>
          <div class="col-6" style="padding-left: 0px;padding-right: 0px;">
            <button id="payInvoiceButton" class="btn btn-danger btn-block"
              onclick="if(LnPrint.user.account.balance > 0){LnPrint.modal.new({from:'balanceCard',name:'withdraw'})}else{LnPrint.notifyMsg({type:'alert',text:'`+noFound+`'})}">
              pay</br>
              invoice
            </button>
          </div>
        </div>
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
          </tr>
        </thead>
    `
    if(founds.userRemotePubkeys.length < 1){
      return tableIntestation + `
          <div class="channelsTableCover" style="z-index: 9;">
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
              <td class="w-b">`+uRP._id+`</td>
              <td class="w-b">`+chan._id+`</td>
              <td>
                <table style="border-style: none;border-spacing: 0;font-size: 0.95em">
                  <tr style="background: unset;border-bottom-style: dotted;">
                    <td>
                      <span class="remotebalance">`+chan.remote_balance+`</span>
                    </td>
                  </tr>
                  <tr style="border-bottom-style: none;background: unset;">
                    <td>
                      <span class="localbalance">`+chan.local_balance+`</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          `
        })
      })
      tableBody += `</tbody></table>`

      return tableIntestation + tableBody
    }
  },
  //TRANSACTION HISTORY TABLE
  transTable: (founds)=>{
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
            <td style="text-align: left;">date</td>
            <td style="text-align: center;">type</td>
            <td style="text-align: right;">amt</td>
          </tr>
        </thead>
    `
    if(founds.history.length > 0){
      let tableBody = `<tbody>`, trColor, dt
      //console.log(founds.history)
      founds.history.forEach((tx)=>{
        if(         tx.from == 'deposit'    ){    trColor = 'trcolorgreen'  }
        else if(    tx.from == 'withdraw'   ){    trColor = 'trcolorred'    }
        else if(    tx.from == 'payment'    ){    trColor = 'trcolorgrey'   }
        else if(    tx.from == 'donation'   ){    trColor = 'trcolorpink'   }
        else{trColor = ''}
        //console.log(tx)
        dt = tx.date.getFullYear() + '/' +
            ('0' + (tx.date.getMonth()+1)).slice(-2) + '/' +
            ('0' + tx.date.getDate()).slice(-2) + ' - ' +
            ('0' + tx.date.getHours()).slice(-2) +':'+
            ('0' + tx.date.getMinutes()).slice(-2) +':'+
            ('0' + tx.date.getSeconds()).slice(-2)
        tableBody += `
          <tr class="`+trColor+`">
            <td style="text-align: left;">`+dt+`</td>
            <td style="text-align: center;">`+tx.from+`</td>
            <td style="text-align: right;">`+tx.amt+`</td>
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
  cropperCommands: ()=>{
    return `
      <div class='cropperCommands'>
        <button id="cropperRotateLeftBtn" class="btn-crop btn btn-sm btn-primary">R</button>
        <button id="cropperRotateRightBtn" class="btn-crop btn btn-sm btn-primary">L</button>
        <button id="cropperUndoBtn" class="btn-crop btn btn-sm btn-primary">undo</button>
        <button id="cropperCropBtn" class="btn-crop btn btn-sm btn-primary">crop</button>
      </div>
    `
  },
  cartTable: (cart,works)=>{
    return `
    <div class="container pb-5 mb-2">
      <!-- Cart Item-->
      <div class="cart-item d-md-flex justify-content-between"><span class="remove-item"><i class="fa fa-times"></i></span>
          <div class="px-3 my-3">
              <a class="cart-item-product">
                  <div class="cart-item-product-thumb"><img src="/img/nophoto.jpg"></div>
                  <div class="cart-item-product-info">
                      <h4 class="cart-item-product-title">Canon EOS M50 Mirrorless Camera</h4><span><strong>Type:</strong> Mirrorless</span><span><strong>Color:</strong> Black</span>
                  </div>
              </a>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Quantity</div>
              <div class="count-input">
                  <input class="qty" type="number" min="1" step="1" value="1">
              </div>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Subtotal</div><span class="text-xl font-weight-medium">$910.00</span>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Discount</div><span class="text-xl font-weight-medium">$35.00</span>
          </div>
      </div>
      <!-- Cart Item-->
      <div class="cart-item d-md-flex justify-content-between"><span class="remove-item"><i class="fa fa-times"></i></span>
          <div class="px-3 my-3">
              <a class="cart-item-product">
                  <div class="cart-item-product-thumb"><img src="/img/nophoto.jpg"></div>
                  <div class="cart-item-product-info">
                      <h4 class="cart-item-product-title">Apple iPhone X 256 GB Space Gray</h4><span><strong>Memory:</strong> 256GB</span><span><strong>Color:</strong> Space Gray</span>
                  </div>
              </a>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Quantity</div>
              <div class="count-input">
                  <input class="qty" type="number" min="1" step="1" value="1">
              </div>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Subtotal</div><span class="text-xl font-weight-medium">$1,450.00</span>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Discount</div><span class="text-xl font-weight-medium">—</span>
          </div>
      </div>
      <!-- Cart Item-->
      <div class="cart-item d-md-flex justify-content-between"><span class="remove-item"><i class="fa fa-times"></i></span>
          <div class="px-3 my-3">
              <a class="cart-item-product">
                  <div class="cart-item-product-thumb"><img src="/img/nophoto.jpg"></div>
                  <div class="cart-item-product-info">
                      <h4 class="cart-item-product-title">HP LaserJet Pro Laser Printer</h4><span><strong>Type:</strong> Laser</span><span><strong>Color:</strong> White</span>
                  </div>
              </a>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Quantity</div>
              <div class="count-input">
                  <input class="qty" type="number" min="1" step="1" value="1">
              </div>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Subtotal</div><span class="text-xl font-weight-medium">$188.50</span>
          </div>
          <div class="px-3 my-3 text-center">
              <div class="cart-item-label">Discount</div><span class="text-xl font-weight-medium">—</span>
          </div>
      </div>
      <!-- Coupon + Subtotal-->
      <div class="d-sm-flex justify-content-end align-items-center text-center text-sm-left py-2">
        <span class="d-inline-block align-middle text-sm font-weight-bold text-uppercase mr-2">total:</span>
        <span class="d-inline-block align-middle text-xl font-weight-bold">$188.50</span>
      </div>
      <!-- Buttons-->
      <hr class="my-2">
      <div class="row pt-3 pb-5 mb-2">
          <div class="col-sm-6 mb-3"><a class="btn btn-style-1 btn-secondary btn-block" href="#"><i class="fe-icon-refresh-ccw"></i>&nbsp;Update Cart</a></div>
          <div class="col-sm-6 mb-3"><a class="btn btn-style-1 btn-primary btn-block" href="checkout-address.html"><i class="fe-icon-credit-card"></i>&nbsp;Checkout</a></div>
      </div>


      </div>
    </div>
    `
  }
}
