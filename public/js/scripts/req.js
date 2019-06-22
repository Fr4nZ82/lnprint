LnPrint.req = {
  changepage: (pagename)=>{
    console.log("#!!-req- Chiamata funzione changepage:")
    Udata.page.name = pagename
    console.log('#!!-req- Richiesta post / con data:')
    console.log(Udata)
    LnPrint.post(Udata.page,(res)=>{
      console.log("#!!-req- questa è la risposta del server:",res)
      console.log("#!!-req- ricarico la pagina (/)")
      location.reload()
      console.log("#!!-req- scroll top")
      $(window).scrollTop(0)
    },false)
  },
  getUserData: (cb)=>{
    LnPrint.post({type: 'req_user_data'},(res)=>{
      console.log('#!!-req- getUserData success response:',res)
      cb(res)
    })
  },
  getTicker: (cb)=>{
    console.log('start AJAX')
    LnPrint.post({type: 'req_ticker'},(res)=>{
      console.log("#!!-req- questa è la risposta del server:",res)
      cb(res)
    })
  },
  getBitcoinFees: (cb)=>{
    console.log('start AJAX')
    LnPrint.post({type: 'req_bitcoinFees'},(res)=>{
      console.log("#!!-req- questa è la risposta del server:",res)
      cb(res)
    })
  },
  getNodeInfo: (cb)=>{
    if(Udata.node.uri != ''){
      cb(Udata.node)
    }else{
      console.log('#!!-getNodeInfo- Richiesta post / con data')
      console.log({type: 'req_node_info'})
      LnPrint.post({type: 'req_node_info'},(res)=>{
        console.log('#!!-drawNodeinfo- success response:')
        console.log(res)
        console.log("#!!-drawNodeinfo- ridisegno il modal con i dati del nodo LN")
        if(res.uri && res.uri != ''){
          Udata.node = res
          cb(Udata.node)
        }else{
          LnPrint.notifyMsg({type:'alert',text:'Can not find LN node info on server side'},()=>{
            console.log("#!!-req- ricarico la pagina (/)")
            location.reload()
            console.log("#!!-req- scroll top")
            $(window).scrollTop(0)
          })
        }
      })
    }
  },
  registerF: (from,prk)=>{
    console.log('#!!-REGISTER- register function avviata')
    let keyPair = bitcoinjs.ECPair.fromWIF(prk)
    let { address } = bitcoinjs.payments.p2pkh({ pubkey: keyPair.publicKey })
    let pubkey = keyPair.publicKey.toString('hex')
    prk = ''
    keyPair = ''
    let wallet={type: 'register',pubkey:pubkey,address:address}
    console.log('#!!-REGISTER- Richiesta post / con data')
    console.log(wallet)
    LnPrint.post(wallet,(res)=>{
      console.log('#!!-REGISTER- success response:')
      console.log(res)
      console.log('#!!-REGISTER- controllo se il server da errore')
      LnPrint.notifyMsg(res.notifyMsg,(notifyModal)=>{
        if(res.ok == 'ok'){
          console.log('#!!-REGISTER- ok, apro modal login')
          LnPrint.modal.new({name:'login',from: from})//on success draw login
        }else{
          console.log('#!!-REGISTER- il server ha dato un errore')
          LnPrint.modal.close(1,()=>{
            LnPrint.modal.draw.new({name:'register',from: from})
          })
        }
      })
    })
  },
  loginF: (from,prk)=>{
    console.log('#!!-LOGIN- login function avviata')
    console.log('#!!-LOGIN- provo a validare la chiave:')
    if(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(prk)){
      console.log('#!!-LOGIN- è valida, creo il wallet da passare al server')
      let wallet = {type:'login',privkey:prk}
      console.log('#!!-LOGIN- Richiesta post / con data',wallet)
      LnPrint.post(wallet,(res)=>{
        console.log('#!!-LOGIN- success response:')
        console.log(res)
        console.log('#!!-LOGIN- elimino wallet')
        wallet = ''
        console.log('#!!-LOGIN- controllo se il server da errore')
        LnPrint.notifyMsg(res.notifyMsg,(notifyModal)=>{
          if(!res._id){
            LnPrint.modal.close(1) //on error return to login
          }else{
            $(notifyModal).on('hidden.bs.modal',()=>{
              LnPrint.modal.close('all',()=>{ //on success login and go to dashboard only if i open modal from the navbar links
                console.log('#!!-LOGIN(on modal.close)- controllo se è stato cliccato dashboard')
                if(from != "dashboard"){ //In this case change links and stuff on page and populate user object
                  console.log('#!!-LOGIN(on modal.close)- NO, imposto l\'on-click dei link a dashboard')
                  $('.toDashboardLinks').attr('onclick',"LnPrint.req.changepage('dashboard')")
                  console.log('#!!-LOGIN(on modal.close)- aggiungo le icone alla navbar')
                  $('#navicons').append(
                    `
                      <div id="userandbell" class="row">
                        <i id="bellicon" class="fas fa-fw fa-bell navbar-icon">
                          <span id="bellcounts" class="label">23</span>
                        </i>
                        <a id="usericon" class="fas fa-fw fa-user-circle navbar-icon"
                        href="javascript:void(0)" onclick="LnPrint.modal.new({from:'usericon',name:'userInfo'})">
                        </a>
                      </div>
                    `
                  )
                  $('#step2').attr('onclick',"LnPrint.modal.new({from:'guide',name:'userInfo'})")
                  Udata.user = {}
                  Udata.user._id = res._id
                  Udata.user.btcaddress = res.btcaddress
                  if(!Udata.user.account){Udata.user.account = {}}
                  Udata.user.account.balance = res.balance
                  console.log('#!!-LOGIN(on modal.close)- connetto il socket')
                  socketA = io()
                }else{
                  console.log('#!!-LOGIN(on modal.close)- SI, changepage su dashboard')
                  LnPrint.req.changepage(from)
                }
              })
            })
          }
        })
      })
    }else{
      console.log("#!!-LOGIN- NON è valida, ALERT:")
      LnPrint.notifyMsg({type:'alert',text:'Need a valid bitcoin wif private key'},()=>{
        LnPrint.modal.close(1)

      })
    }
  },
  genInvoice: (amt,from,cb)=>{
    console.log('#!!-GENINVOICE- Richiesta post / con amt',amt)
    LnPrint.loading.show()
    LnPrint.post({type: 'gen_invoice', amt: amt, from: from},(res)=>{
      console.log('#!!-GENINVOICE- success response:',res)
      console.log("#!!-GENINVOICE- apro un modal con i dati della invoice")
      LnPrint.loading.hide()
      if(res.invoice && res.invoice != ''){
        if(Udata.user){
          Udata.user.account.payreq.push(res)
        }
        cb(res)
      }else{
        LnPrint.notifyMsg(res.notifyMsg)
      }
    })
  },
  genAddress: (from)=>{
    console.log('#!!-GENADDRESS- Richiesta post / from',from)

      LnPrint.loading.show()
      LnPrint.post({type: 'gen_newAddress', from: from},(res)=>{
        console.log('#!!-GENADDRESS- success response:',res)
        console.log("#!!-GENADDRESS- apro un modal con i dati della invoice")
        LnPrint.loading.hide()
        if(res._id && res._id != ''){
          if(Udata.user){
            if(Udata.user.usedAddress){
              Udata.user.usedAddress.push(res._id)
            }else{
              Udata.user.usedAddress = [res._id]
            }
          }
          LnPrint.modal.new({name:'address',from:from,addressData:res})
        }else{
          LnPrint.notifyMsg(res.notifyMsg)
        }
      })
  },
  decodeInvoiceF: (invoice,from,work)=>{ //IF WORK IS NOT PRESENT IS A WITHDRAW //WHAT??
    console.log('#!!-DECODEINVOICE- Richiesta post / con invoice',invoice)

    LnPrint.loading.show()
    LnPrint.post({type: 'dec_invoice', invoice: invoice},(res)=>{
      console.log('#!!-DECODEINVOICE- success response:',res)
      LnPrint.loading.hide()
      LnPrint.notifyMsg(res.notifyMsg,(msg)=>{
        if(msg == 'noMsg'){
          console.log("#!!-DECODEINVOICE- apro un modal con i dati della invoice")
          LnPrint.modal.new({
            name:'invoiceInfo',
            from:from,
            work: work || null,
            decodedInvoiceData:res
          })
        }
      })
    })
  },
  payInvoiceF: (invoice,from,work)=>{//IF WORK IS NOT PRESENT IS A WITHDRAW //NO
    console.log('#!!-PAYINVOICE- Richiesta post /')

    LnPrint.post({type: 'pay_invoice', invoice:invoice, from:from, work:work},(res)=>{
      console.log('#!!-PAYINVOICE- response:',res)
      LnPrint.notifyMsg(res.notifyMsg,(msg)=>{
        if(msg != 'noMsg'){
          LnPrint.modal.close(2)
        }
      })
    })
  },
  payFromAccount: (amt,from,work,cb)=>{
    cb = cb || noop
    work = work || 'no_Work_or_donation'
    if(amt <= Udata.user.account.balance){
      LnPrint.post({type: 'payFromAccount', amt: amt, work: work, from:from},(res)=>{
        console.log('#!!-payFromAccount- response:',res)
        LnPrint.notifyMsg(res.notifyMsg,(notifyModal)=>{
          Udata.user.account = res.account
          console.log("#!!-payFromAccount- pagamento effettuato con successo")
          $(notifyModal).on('hidden.bs.modal',()=>{
            LnPrint.modal.close('all',()=>{})
          })
        })
      })
    }
  },
  sendOnChain: (address,amt,fee,from)=>{
    console.log('#!!-sendOnchain- Richiesta post /')
    LnPrint.post({type: 'pay_onchain', address:address, amt:amt, fee:fee, from:from},(res)=>{
      console.log('#!!-sendOnchain- response:',res)
      LnPrint.notifyMsg(res.notifyMsg,(msg)=>{
        if(msg == 'noMsg'){
          LnPrint.modal.close('all')
          Udata.user.account.balance += res.txData.amt
          res.txData.date = new Date(res.txData.date)
          Udata.user.account.ochistory.push(res.txData)
          LnPrint.modal.new({
            from: 'notifyMsg',
            name: 'message',
            type: 'msg',
            text: 'tx transaction sended!',
            autoclose:true
          })
          if(thisPageName == 'dashboard'){
            console.log('#!!-onLoad- ridisegno ultima pagina visitata')
            LnPrint.redraw()
          }
        }
      })
    })
  },
  products: (cb)=>{
    LnPrint.post({type: 'req_products'},(res)=>{
      cb(res)
    })
  },
  product: (pId,photo,cb)=>{
    cb = cb || noop
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'req_product',
        productId: pId,
        photo: photo
      },
      success: function(response){
        cb(response)
      }
    })
  },
  preset: (name,cb)=>{
    $.ajax({
      type: 'POST',
      url: '/',
      data: {
        type: 'req_preset',
        name: name
      },
      success: function(response){
        console.log('preset req response',response)
        cb(response)
      }
    })
  },
  logOut: ()=>{
    console.log('#!!-req- Chiamata funzione logOut: ')
    console.log('#!!-req- Richiesta post / con data: ')
    console.log({type: 'logout'})
    LnPrint.post({type: 'logout'},(res)=>{
      console.log("#!!-req- questa è la risposta del server: ",res)
      LnPrint.notifyMsg(res.notifyMsg,()=>{
        console.log('#!!-req- ricarico la pagina (/)')
        location.reload()
        console.log("#!!-req- scroll alla barra")
        $(window).scrollTop(0)
      })
    })
  }
}
