LnPrint.modal.print={
  voidModal: (n,cb)=>{
    cb('#dynamicModal'+ n,n)
    return `
      <div class="modal fade dynamicModal" id="dynamicModal`+ n +`"
        tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-dialog-pers" role="document">
          <div class="modal-content-pers modal-content">
          </div>
        </div>
      </div>
    `
  },
  fulmineContent: (n)=>{
    return `
      <div class="modal-content-fulmine modal-content">
      </div>
    `
  },
  commonStructure: (modalName,from)=>{
    var title;
    if(modalName == "keyQuery"    ){  title="Have You a Key?"           }else
    if(modalName == "nodeInfo"    ){  title="Our Lightning Network node"}else
    if(modalName == "register"    ){  title="Register"                  }else
    if(modalName == "login"       ){  title="Login"                     }else
    if(modalName == "userInfo"    ){  title="User Info"                 }else
    if(modalName == "deposit"     ){
      if(  from == 'balanceCard'  ){  title="Deposit"                 }else
      if(  from == 'payBtn'       ){  title="Pay"                     }else
      if(  from == 'donate'       ){  title="Donate"                  }else
      {title=""                                                       } }else
    if(modalName == "withdraw"    ){  title="Withdraw"                  }else
    if(modalName == "invoice"     ){  title="Invoice"                   }else
    if(modalName == "invoiceInfo" ){  title="Confirm payment"           }else
    if(modalName == "withdrawInfo"){  title="Withdraw report"           }else
    if(modalName == "order1"      ){  title="Order"                     }else
    if(modalName == "draft1"      ){  title="Draft"                     }else
    {title=""}
    return `
      <div class="modal-header">
        <h5 class="modal-title w-100 text-center">`+ title +`</h5>
      </div>
      <div class="modal-body"></div>
    `
  },
  keyQueryContent:(from)=>{
    return `
      <div class="keydiv text-center">
        <button id="havekeybtn" class="btn btn-primary btn-block"
        onclick="if(!LnPrint.modal.disabled){LnPrint.modal.new({from:'`+ from +`',name:'login'})}">Have a Key</button><br>
        <button id="keygenbtn" class="btn btn-warning btn-block"

        onclick="if(!LnPrint.modal.disabled){LnPrint.modal.new({from:'`+ from +`',name:'register',prk:LnPrint.genKey()})}">
          Generate a Key

        </button><br>
        <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
        onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close('all')}">Close</button>
      </div>
    `
  },
  registerContent:(from,prk)=>{
    return `
      <button id="showbtn" class="btn btn-danger">Show the Key</button>
      <button id="copybtn" class="btn btn-primary"
      onclick="if(!LnPrint.modal.disabled){LnPrint.copyF('theRegisterKey',()=>{$('#keysaved').show()})}">Copy the Key</button>
      <textarea id="theRegisterKey" readonly rows="2" class="theKey">`+ prk +`</textarea>
      <div align="center" id="keysaved"><label>
        <input id="keycheck" type="checkbox">I have saved the key
      </label></div>
      <button id="registerbtn" class="btn btn-success btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.req.registerF('`+ from +`','`+ prk +`')}">Register</button>
      <button id="backbtn" class="btn btn-primary float-left"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Back</button>
      <button  id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn float-right"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close('all')}">Close</button>
    `
  },
  loginContent:(from)=>{
    return `
      <textarea id="theLoginKey" placeholder="Insert your key" rows="2"
      class="theKey"></textarea><br><br>
      <button id="loginbtn" class="btn btn-success btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.req.loginF('`+ from +`',$('#theLoginKey').val())}">Login</button>
      <button id="backbtn" class="btn btn-primary float-left"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Back</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn float-right"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close('all')}">Close</button>
    `
  },
  nodeInfoContent:(node)=>{
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification text-center">
        <p>Alias: `+ node.alias +`</p>
        <div id="qrdiv" class="container-fluid justify-content-center"></div>
        <textarea readonly id="theUri" class="theKey">`+ node.uri +`</textarea>
      </div>
      <button id="copybtn" class="btn btn-primary btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.copyF('theUri')}">Copy the URI</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Close</button>
    `
  },
  userInfoContent:()=>{
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification container-fluid">
        <p class="wb">Your public key is:
          <br>`+ LnPrint.user._id +`
          <br>and your bitcoin address is:
          <br>`+ LnPrint.user.btcaddress +`
        </p>
      </div>
      <button class="btn btn-secondary float-left" id="logOutBtn"
      onclick="if(!LnPrint.modal.disabled){LnPrint.req.logOut()}">LogOut</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn float-right"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Close</button>
    `
  },
  depositContent:(from)=>{
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification text-center">
        <div class="keyntitle">Amount</div>
        <textarea id="theAmount" class="theKey" placeholder="satoshis"></textarea>
      </div>
    `+(()=>{
      if(!!LnPrint.user){
        if(from != 'balanceCard'){
          return `
            <button disabled id="payBtn" class="btn btn-success btn-block"
            onclick="if(!LnPrint.modal.disabled){LnPrint.req.payFromAccount($('#theAmount').val(),'`+ from +`')}">
          `+(()=>{
            if(from == 'donate'){
              return 'donate'
            }else if(from == 'draft' || from == 'order'){
              return 'pay'
            }
          })() +`
          </button>
          `
        }else return ''
      }else return ''
    })()+`
      <button disabled id="genInvoiceBtn" class="btn btn-primary btn-block">Generate Invoice</button>
      `+(()=>{
        if(from == 'donate'){
          return `
            <button id="payOcBtn" class="btn btn-info btn-block"
            onclick="if(!LnPrint.modal.disabled){LnPrint.req.genAddress('`+ from +`')}">
            donate on chain</button>
          `
        }else if(from == 'draft' || from == 'order'){
          return `
            <button id="payOcBtn" class="btn btn-info btn-block"
            onclick="if(!LnPrint.modal.disabled){LnPrint.req.genAddress('`+ from +`')}">
            pay on chain</button>
          `
        }else return ''
      })() +`
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Cancel</button>
    `
  },
  withdrawContent:(from)=>{
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification text-center">
        <div class="keyntitle">Paste invoice</div>
        <textarea id="theWithdrawInvoice" class="theKey" style="width:85%;"></textarea>
        <button id="photoBtn" class="btn btn-primary">F</button>
      </div>
      <button id="withdrawInvoiceBtn" class="btn btn-primary btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.req.decodeInvoiceF($('#theWithdrawInvoice').val(),'withdraw')}">Decode invoice</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Close</button>
      <div id="vpreviewdiv" style="display:none">
        <div style="flex-grow: 1;">
          <video id="vpreview" style="width: 100%;height: 100%;"></video>
        </div>
        <div id="sourceSelectPanel" style="text-align: center;padding-bottom: 35px;position: absolute;width: 100%;height: 100%;">
          <div style="height: 90%;"></div>
          <div>
            <label id="sSlabel" for="sourceSelect" style="opacity:0;">Camera:</label>
            <select id="sourceSelect" style="opacity:0;max-width:400px;">
            </select>
            <button class="btn btn-primary" id="resetButton">Close</button>
          </div>
        </div>
      </div>

    `
  },
  ocWithdrawContent:(from,bf)=>{
    // let cmd = "LnPrint.req.sendOnChain("+
    //             "$('#theAddress').val(),"+
    //             "$('#theAmount').val(),"+
    //             "$('input[name=fee]:checked').val(),"+
    //             "'"+ from + "'"+
    //           ")"
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification text-center">
        <div class="keyntitle">Address</div>
        <textarea id="theAddress" class="theKey" style="width:85%;"></textarea>
        <button id="photoBtn" class="btn btn-primary">F</button>
        <br>
        <div class="keyntitle">Amount</div>
        <textarea id="theAmount" class="theKey" placeholder="satoshis"></textarea>
        <input type="radio" name="fee" value="`+bf.fastestFee+`"> fastest:
          <label>`+bf.fastestFee+`</label>
        <input type="radio" name="fee" value="`+bf.halfHourFee+`" checked> half our:
          <label>`+bf.halfHourFee+`</label>
        <input type="radio" name="fee" value="`+bf.hourFee+`"> hour:
          <label>`+bf.hourFee+`</label>
      </div>
      <button disabled id="sendCoinsBtn" class="btn btn-primary btn-block">send</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Close</button>
      <div id="vpreviewdiv" style="display:none">
        <div style="flex-grow: 1;">
          <video id="vpreview" style="width: 100%;height: 100%;"></video>
        </div>
        <div id="sourceSelectPanel" style="text-align: center;padding-bottom: 35px;position: absolute;width: 100%;height: 100%;">
          <div style="height: 90%;"></div>
          <div>
            <label id="sSlabel" for="sourceSelect" style="opacity:0;">Camera:</label>
            <select id="sourceSelect" style="opacity:0;max-width:400px;">
            </select>
            <button class="btn btn-primary" id="resetButton">Close</button>
          </div>
        </div>
      </div>
    `
  },
  invoiceInfoContent:(invoiceInfo,from,work)=>{
    var withdrawDisabled = `disabled`
    if(LnPrint.user.account.balance < invoiceInfo.sats){
      withdrawDisabled = ``
    }else{
      withdrawDisabled = ``
    }
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification container-fluid">
        <p class="wb">Your invoice:
          <br>`+ invoiceInfo.invoice +`
          <br>amount:
          <br>`+ invoiceInfo.sats +`
          <br>eexipres at:
          <br>`+ invoiceInfo.expires_at +`
        </p>
      </div>
      <button class="btn btn-primary float-left" id="confirmWithdrawButton" `+withdrawDisabled+`
      onclick="if(!LnPrint.modal.disabled){LnPrint.req.payInvoiceF('`+ invoiceInfo.invoice +`','`+ from +`','`+ work +`')}">Confirm Withdraw</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn float-right"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Close</button>
    `
  },
  withdrawInfoContent:(paymentData,from)=>{
    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification container-fluid">
        <p class="wb">You have received:
          <br>`+ paymentData.amt +` sat
          <br>fee:
          <br>`+ paymentData.fee_mtokens +` millisat
        </p>
      </div>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(1)}">Close</button>
    `
  },
  invoiceContent:(payreq,from)=>{
    if(from == 'balanceCard' || from == 'donate'){
      var modalToClose = LnPrint.modal.active.length-1;
    }else{
      var modalToClose = 1;
    }

    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification text-center">
        <div id="qrdiv" class="container-fluid justify-content-center"></div>
        <textarea id="theInvoice" class="theKey">`+ payreq.invoice.toString() +`</textarea>
      </div>
      <div class="qrlabel">
        <p id="invoicecountdown"></p>
      </div>
      <button id="copybtn" class="btn btn-primary btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.copyF('theInvoice')}">Copy Invoice</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(`+ modalToClose +`)}">Close</button>
    `
  },
  addressContent:(addressData,from,bitcoinFees)=>{
    if(from == 'balanceCard' || from == 'donate'){
      var modalToClose = LnPrint.modal.active.length-1;
    }else{
      var modalToClose = 1;
    }

    return `
      <div id="keynotification`+ (LnPrint.modal.active.length-1) +`" class="keynotification text-center">
        <div id="qrdiv" class="container-fluid justify-content-center"></div>
        <textarea id="theAddress" class="theKey">`+ addressData._id.toString() +`</textarea>
      </div>
      <div class="qrlabel">
        <p id="suggestedfees"></p>
      </div>
      <button id="copybtn" class="btn btn-primary btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.copyF('theAddress')}">Copy Address</button>
      <button id="closeModalBtn`+ (LnPrint.modal.active.length-1) +`" class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close(`+ modalToClose +`)}">Close</button>
    `
  },
  order1:(product,from)=>{
    //delete product.mainPhoto
    //console.log(product)
    return `
      <div class="order-form">
        <div class="oform-group">
          <label for="oqty">quantity</label>
          <input type="number" placeholder="1" class="pform-control oqty" name="oqty" min="1" step="1">
        </div>
      </div>
      <button class="btn btn-primary btn-block nextbtn"
      onclick="if(!LnPrint.modal.disabled){}">next</button>
      <button class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close('all')}">Close</button>
    `
  },
  draftReq:(product,from)=>{
    console.log('product',product)
    return `
      <form action="presetForm" method="post" enctype="multipart/form-data">
        <div class="draftreq-form"></div>
        <input type="submit">
      </form>

      <button class="closeModalBtn btn btn-block"
      onclick="if(!LnPrint.modal.disabled){LnPrint.modal.close('all')}">Close</button>
      <button class="btn btn-primary btn-block nextbtn"
      onclick="if(!LnPrint.modal.disabled){}">next</button>
    `
  }
}
