LnPrint.req = {
  changepage: (pagename)=>{
    //console.log("#!!-req- Chiamata funzione changepage:",pagename)

    LnPrint.page = pagename
    //console.log("#!!-req- Chiamata funzione changepage:",LnPrint.page)
    LnPrint.post(
      {type:'page',name:LnPrint.page},
      {
        ifYes:(res)=>{
          //console.log("#!!-req- questa è la risposta del server:",res)
          LnPrint.update(()=>{
            LnPrint.drawPage()
            $(window).scrollTop(0)
          })
        }
      }
    )
  },
  getUserData: (cb)=>{
    LnPrint.post(
      {type: 'req_user_data'},
      {
        ifYes:(res)=>{
          //console.log('#!!-req- getUserData success response:',res)
          cb(res)
        }
      }
    )
  },
  getTicker: (cb)=>{
    LnPrint.post(
      {type: 'req_ticker'},
      {
        ifYes:(res)=>{
          //console.log("#!!-req- questa è la risposta del server:",res)
          cb(res)
        }
      }
    )
  },
  getBitcoinFees: (cb)=>{
    LnPrint.post(
      {type: 'req_bitcoinFees'},
      {
        ifYes:(res)=>{
          //console.log("#!!-req- questa è la risposta del server:",res)
          cb(res)
        }
      }
    )
  },
  getNodeInfo: (cb)=>{
    if(LnPrint.node.uri != ''){
      cb(LnPrint.node)
    }else{
      LnPrint.post(
        {type: 'req_node_info'},
        {
          ifYes:(res)=>{
            LnPrint.node = res
            cb(LnPrint.node)
          }
        }
      )
    }
  },
  registerF: (from,prk)=>{
    let keyPair = bitcoinjs.ECPair.fromWIF(prk)
    let { address } = bitcoinjs.payments.p2pkh({ pubkey: keyPair.publicKey })
    let pubkey = keyPair.publicKey.toString('hex')
    prk = ''
    delete prk
    keyPair = ''
    delete keyPair
    let wallet={type: 'register',pubkey:pubkey,address:address}
    LnPrint.post(
      wallet,
      {
        ifYes:(res)=>{
          LnPrint.modal.new({name:'login',from: from})
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  loginF: (from,prk)=>{
    if(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(prk)){
      let wallet = {type:'login',privkey:prk}
      LnPrint.post(
        wallet,
        {
          ifYes:(res)=>{
            wallet = ''
            delete wallet

            LnPrint.modal.close('all',()=>{ //on success login and go to dashboard only if one open modal from the navbar links
              if(from != "dashboard"){ //In this case change links and stuff on page and populate user object
                $('.toDashboardLinks').attr('onclick',"LnPrint.req.changepage('dashboard')")
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
                LnPrint.user = {}
                LnPrint.user._id = res._id
                LnPrint.user.btcaddress = res.btcaddress
                if(!LnPrint.user.account){LnPrint.user.account = {}}
                LnPrint.user.account.balance = res.balance
                //???socketA = io()
              }else{
                LnPrint.req.changepage(from)
              }
            })
          },
          ifErr:()=>{ //on error close modals and refresh
            LnPrint.standardErrorBehavior()
          }
        }
      )
    }else{
      LnPrint.notifyMsg({type:'alert',text:'Need a valid bitcoin wif private key'})
    }
  },
  genInvoice: (amt,from,cb)=>{
    LnPrint.loading.show()
    LnPrint.post(
      {type: 'gen_invoice', amt: amt, from: from},
      {
        ifYes:(res)=>{
          if(LnPrint.user){
            LnPrint.user.account.payreq.push(res)
          }
          cb(res)
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  genAddress: (from)=>{
    LnPrint.loading.show()
    LnPrint.post(
      {type: 'gen_newAddress', from: from},
      {
        ifYes:(res)=>{
          if(LnPrint.user && from != 'donate'){
            if(LnPrint.user.usedAddress){
              LnPrint.user.usedAddress.push(res._id)
            }else{
              LnPrint.user.usedAddress = [res._id]
            }
          }
          LnPrint.modal.new({name:'address',from:from,addressData:res})
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  decodeInvoiceF: (invoice,from,work)=>{ //IF WORK IS NOT PRESENT IS A WITHDRAW //WHAT??
    LnPrint.loading.show()
    LnPrint.post(
      {type: 'dec_invoice', invoice: invoice},
      {
        ifYes:(res)=>{
          LnPrint.modal.new({
            name: 'invoiceInfo',
            from: from,
            work: work || null,
            decodedInvoiceData: res
          })
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  payInvoiceF: (invoice,from,work)=>{//IF WORK IS NOT PRESENT IS A WITHDRAW //NO
    LnPrint.post(
      {type: 'pay_invoice', invoice:invoice, from:from, work:work},
      {
        ifYes: ()=>{
          LnPrint.modal.close('2')
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  payFromAccount: (amt,from,work,cb)=>{
    cb = cb || noop
    work = work || 'no_Work_or_donation'
    if(amt <= LnPrint.user.account.balance){
      LnPrint.post(
        {type: 'payFromAccount', amt: amt, work: work, from:from},
        {
          ifYes:(res)=>{
            LnPrint.user.account = res.account
            $(notifyModal).on('hidden.bs.modal',()=>{
              LnPrint.modal.close('all',()=>{})
            })
          },
          ifErr:()=>{
            LnPrint.standardErrorBehavior()
          }
        }
      )
    }
  },
  sendOnChain: (address,amt,fee,from)=>{
    LnPrint.post(
      {type: 'pay_onchain', address:address, amt:amt, fee:fee, from:from},
      {
        ifYes:(res)=>{
          LnPrint.modal.close('all')
          LnPrint.user.account.balance -= res.txData.amt
          res.txData.date = new Date(res.txData.date)
          LnPrint.user.account.ochistory.push(res.txData)
          if(thisPageName == 'dashboard'){
            //console.log('#!!-onLoad- ridisegno ultima pagina visitata')
            LnPrint.redraw()
          }
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  },
  products: (cb)=>{
    LnPrint.post(
      {type: 'req_products'},
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
  product: (pId,photo,cb)=>{
    cb = cb || noop
    LnPrint.post(
      {type: 'req_product', productId: pId, photo: photo},
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
  preset: (name,cb)=>{
    LnPrint.post(
      {type: 'req_preset', name: name},
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
  logOut: ()=>{
    LnPrint.post(
      {type: 'logout'},
      {
        ifYes:(res)=>{
          location.reload()
          $(window).scrollTop(0)
        },
        ifErr:()=>{
          LnPrint.standardErrorBehavior()
        }
      }
    )
  }
}
