LnPrint.modal = {
  active: ['none'],
  last: {
    modal: {}
  },
  busy: 0,
  disabled: false,
  action:{
    waitResponse:(word,cb)=>{
      var modal = LnPrint.modal
      if(word == 'wait'){
        console.log('modal disabled')
        modal.disabled = true
        console.log('++busy++ waiting server response')
        ++modal.busy
        modal.action.waiting = setTimeout(function () {
          console.log('modal enabled because server does not respon after timeout')
          modal.disabled = false
          console.log('--busy-- because server does not respon after timeout')
          --modal.busy
          modal.close('all')
          modal.action.waiting = false
        }, ajaxTimeout)
      }else if(word == 'done'){
        clearTimeout(modal.action.waiting)
        modal.action.waiting = false
        console.log('modal enabled')
        modal.disabled = false
        console.log('--busy-- server rosponse arrived')
        --modal.busy
      }
    },
    waiting: false,
    queue:[],
    spooler:(action,data,cb)=>{
      cb = cb || noop
      if(LnPrint.modal.busy == 0 && !!LnPrint.bitcoinReady && !!LnPrint.qrcodeReady){
        action(data,cb)
        LnPrint.modal.action.queue.shift()
      }
    }
  },
  new: (modalData,cb)=>{ //AGGIUNGE A FINE PAGINA UN NUOVO MODAL VUOTO CON ID 'dynamicModal'+(modal.active.length-1) E LO APRE
    cb = cb || noop
    var modal = LnPrint.modal

      var _modalData = {}
      Object.assign(_modalData,modalData)
      var _cb = ()=>{cb()}

      console.log('#!!-modal.new- status dei modal:', JSON.stringify(modal),modalData)

      if(modal.busy === 0){
        if((!!LnPrint.bitcoinReady && !!LnPrint.qrcodeReady) || _modalData.name == 'message'){
          console.log('#!!-modal.new- Un evento('+modalData.from+') crea un modal('+modalData.name+')')

          ++modal.busy
          console.log('++busy++ nuovo modal ('+modalData.name+') add html to DOM...')
          if(modalData.autoclose){
            ++modal.busy
            console.log('++busy++ because autoclose')
          }

          modal.active.push(modalData.name)

          $('#thebody').append(modal.print.voidModal(modal.active.length-1,(_modalId,_modalNumber)=>{
            console.log('#!!-modal.new- modal added to html')
            _modalData.id = _modalId
            _modalData.number = _modalNumber
            --modal.busy
            console.log('--busy-- modal add html to DOM finita: ', _modalId)
          }))

          if(_modalData.name == 'fulmine'){
            $(_modalData.id).removeClass('fade')
          }
          $(_modalData.id)
          .on('show.bs.modal',function(){
            ++modal.busy
            console.log('++busy++ nuovo modal inizio apertura')
          })
          .on('shown.bs.modal',function(){
            console.log('#!!-modal.new- modal showed: ',this)
            --modal.busy
            console.log('--busy-- nuovo modal apertura finita')
            autosize($('.theKey'))
            cb(_modalData.id)
          })
          .on('hidden.bs.modal', function(){
            console.log('#!!-onLoad- closed modal: ',this)
            if(modalData.onClose && typeof modalData.onClose == 'function'){
              modalData.onClose()
            }
            modal.last.modal = $(this).remove()
            modal.active.pop()
          })
          console.log(_modalData)
          $(_modalData.id)
          .modal('show',_modalData)

        }else{
          $('#backLoading').show().animate({opacity: 1}, 100)
          console.log('#!!-modal.new- modal non è pronto, lo metto in coda!')
          modal.action.queue.push({
            action: modal.new,
            data: _modalData,
            cb: ()=>{
              setTimeout(function () {
                $('#backLoading').animate({
                  opacity: 0,
                }, 100, function() {
                  $('#backLoading').hide()
                  _cb()
                })
              }, 500)
            }
          })
        }
      }else{
        console.log('#!!-modal.new- modal non è pronto, lo metto in coda!')
        modal.action.queue.push({
          action: modal.new,
          data: _modalData,
          cb: _cb
        })
      }
  },
  close: (n,cb)=>{
    cb = cb || noop
    var modal = LnPrint.modal
    var hMOM = modal.active.length-1

    if(hMOM > 0){
      console.log('#!!-modal.close- modal.close function avviata con n='+n+', active modals: ',modal.active)
      if(n == 'all'){
        console.log('#!!-modal.close- chiudo tutti i '+n+' modals, cioè dal '+(hMOM)+' al '+(hMOM))
        var _n = 'all'
        n = hMOM
      }else if(n[0]){
        console.log('#!!-modal.close- chiudo '+n[1]+' modals, cioè dal '+(hMOM)+' al '+((hMOM)-n[1]))
        if(n[0] == 'auto'){
          --modal.busy
          console.log('--busy-- bacause autoclose')
          var _n = {}
          Object.assign(_n,n)
          n = n[1]
        }
      }else{
        console.log('#!!-modal.close- chiudo '+n+' modals, cioè dal '+(hMOM)+' al '+((hMOM)-n))
        var _n = n
      }


      var _cb = ()=>{cb()}
      console.log('#!!-modal.close- se modal.busy è 0 iniza il ciclo di chiusura. modal.busy = ',modal.busy)
      if(modal.busy === 0){

        ++modal.busy
        console.log('++busy++ inizio ciclo di chiusura')

        var m = hMOM

        for(var i=m; i>(m-n); i=(i-1)){
          console.log('ciclo chiusura, i = '+i+' modal to close:',$('#dynamicModal'+i))

          if(i == (m-n+1)){
            $('#dynamicModal'+i)
            .on('hidden.bs.modal',()=>{
              --modal.busy
              console.log('--busy-- fine ciclo di chiusura')

              console.log('#!!-modal.close- modals chiusi, status dei modal:', modal)
              cb()
            })
          }

          $('#dynamicModal'+i).modal('hide')

        }

      }else{
        console.log('#!!-modal.close- modal non è pronto, lo metto in coda!')
        modal.action.queue.push({
          action: modal.close,
          data: _n,
          cb: _cb
        })
      }
    }else{
      console.log('#!!-modal.close- non ci sono modal da chiudere!')
      cb()
    }
  },
  draw: {
    fulmine:(modalData)=>{
      var modal = LnPrint.modal
      //console.log('DRAW FULMINE')
      let modalId = modalData.id
      let modalNumber = modalData.number
      $(modalId).css('display','block').css('background-color','#000000').css('opacity', 0.97)
      //console.log(1)
      $(modalId+' .modal-content').replaceWith(`<div class="modal-content-fulmine modal-content"></div>`)
      //console.log(2)
      setTimeout(function () {
        $(modalId+' .modal-content').css('opacity',0)
        //console.log(3)
        setTimeout(function () {
          $(modalId+' .modal-content').css('opacity',1)
          //console.log(4)
          setTimeout(function () {
            $(modalId+' .modal-content').css('opacity',0)
            //console.log(5)
            setTimeout(function () {
              $(modalId+' .modal-content').css('opacity',1)
              //console.log(6)
              setTimeout(function () {
                $(modalId+' .modal-content').css('opacity',0)
                //console.log(7)
                setTimeout(function () {
                  $(modalId+' .modal-content').css('opacity',1)
                  //console.log(8)
                  setTimeout(function () {
                    $(modalId+' .modal-content').css('opacity',0)
                    var afterFulmine = ()=>{
                      if(modalData.from == 'eventWithdraw'){
                        modal.new({name: 'withdrawInfo', from: modalData.from, paymentData: modalData.paymentData})
                      }
                    }
                    if((modal.active[modalNumber - 1] == 'invoice') || (modal.active[modalNumber - 1] == 'invoiceInfo')){
                      if((modal.active[modalNumber - 2] == 'deposit') || (modal.active[modalNumber - 2] == 'withdraw')){
                        modal.close(['auto',3],afterFulmine)
                      }else{
                        modal.close(['auto',2],afterFulmine)
                      }
                    }else{
                      modal.close(['auto',1],afterFulmine)
                    }
                  }, 120)
                }, 50)
              }, 30)
            }, 60)
          }, 30)
        }, 70)
      }, 170)
    },
    withdrawInfo:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.withdrawInfoContent(modalData.paymentData,modalData.from))
    },
    invoiceInfo:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.invoiceInfoContent(modalData.decodedInvoiceData,modalData.from,modalData.work))
    },
    nodeInfo:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      LnPrint.req.getNodeInfo(function(node){
        $(modalData.id +' .modal-body')
        .append(LnPrint.modal.print.nodeInfoContent(node))
        $('#qrdiv')
        .qrcode({width: 1200,height: 1200, text: node.uri})
      })
    },
    products:(modalData)=>{

    },
    keyQuery:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.keyQueryContent(modalData.from))
    },
    login:(modalData)=>{
      //console.log('#!!-modal.draw.login-')
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.loginContent(modalData.from))
      $('#loginbtn').prop('disabled', true)
      $('#theLoginKey').on('input change', function() {
        //console.log('controllo #theLoginKey..')
        var notvalid = !(/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test($('#theLoginKey').val()))
        //console.log('is invalid: '+notvalid)
        var isEmpty = !$('#theLoginKey').val() != ''
        //console.log('empty: '+isEmpty)
        $('#loginbtn').prop('disabled',(isEmpty || notvalid))
      })
    },
    register:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      var prk = modalData.prk.toString()
      modalData.prk = ''
      //console.log('#!!-modal.draw.register- disegno il modal')
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.registerContent(modalData.from,prk))
      $("#theRegisterKey").css('opacity', '0').css('height', '1px')
      $("#keysaved").hide()
      $("#registerbtn").prop("disabled", true)
      $("#showbtn").click(function (){
        $("#showbtn").hide()
        $("#showbtn").after('<button id="hidebtn" class="btn btn-danger">Hide the Key</button>')
        $("#theRegisterKey").css('opacity', '1').css('height', 'auto')
        $("#keysaved").show()
        $("#hidebtn").click(function (){
          $("#theRegisterKey").css('opacity', '0').css('height', '1px')
          $("#hidebtn").hide()
          $("#showbtn").show()
        })
      })
      $('#keycheck').change(function (){
        if(this.checked) {
          $("#registerbtn").prop("disabled", false)
        }else{
          $("#registerbtn").prop("disabled",true)
        }
      })
    },
    onDemand:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(modalData.content)
      modalData.after()
    },
    message:(modalData)=>{
      console.log('msgToNotify: ',modalData)
      $(modalData.id +' .modal-content')
      .append('<p id="alertText"><h5>'+modalData.text+'</h5></p>')
      .addClass('messageModal')
      if(modalData.type == 'notify'){
        $(modalData.id +' .modal-content')
        .addClass('notifyMessage messageModalContent')
      }else if(modalData.type == 'alert'){
        $(modalData.id +' .modal-content')
        .addClass('alertMessage messageModalContent')
      }

      //message modals time to show
      var timeToShow = modalData.text.length * 75
      if (timeToShow < 1400){timeToShow = 1400}
      if(timeToShow > 5000){timeToShow = 5000}

      setTimeout(function () {
        LnPrint.modal.close(['auto',1])
      }, timeToShow)
    },
    prompt:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append('<p id="alertText"><h5>'+modalData.text+'</h5></p>')
      .append('<div><button class="btn btn-danger" id="promptYesBtn">yes</button>'+
              '<button class="btn btn-secondary" id="promptNoBtn">no</button></div>')
      .addClass('messageModal promptMessage messageModalContent')
      $('#promptYesBtn').on('click',()=>{
        LnPrint.modal.close(1,()=>{
          modalData.cbYes()
        })
      })
      $('#promptNoBtn').on('click',()=>{
        cbNo = modalData.cbNo || noop
        LnPrint.modal.close(1,()=>{
          cbNo()
        })
      })
    },
    important:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append('<p class="importantText">'+modalData.text+'</p>')
      .append('<div><button class="btn btn-primary" id="importantOkBtn">OK</button></div>')
      .addClass('messageModal importantMessage messageModalContent')
      $('#importantOkBtn').on('click',()=>{
        LnPrint.modal.close(1)
      })
    },
    userInfo:(modalData)=>{
      //console.log('draw userinfo')
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.userInfoContent())
    },
    deposit:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name,modalData.from))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.depositContent(modalData.from))

      $('#theAmount').on('input change',function(){
        if(Math.sign($(this).val()) === 1 && $(this).val() <= LnPrint.conf.maxInvoiceAmt){
          $('#genInvoiceBtn').removeAttr('disabled')
          if(!!LnPrint.user){
            if(LnPrint.user.account.balance >= $(this).val()){
              $('#payBtn').removeAttr('disabled')
            }else{
              $('#payBtn').attr('disabled','disabled')
            }
          }
        }else{
          $('#payBtn,#genInvoiceBtn').attr('disabled','disabled')
        }
      })

      $('#genInvoiceBtn').click(()=>{
        if(!LnPrint.modal.disabled){
          LnPrint.req.genInvoice($('#theAmount').val(),modalData.from,(res)=>{
            LnPrint.modal.new({name:'invoice',from:modalData.from,payreq:res})
          })
        }
      })
    },
    withdraw:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.withdrawContent(modalData.from))
      LnPrint.readQR('photoBtn',(err,qrValue)=>{
        if(err){return (()=>{
          alert(err)
          //console.log(err)
        })()}
        if(qrValue){
          $('#theWithdrawInvoice').val(qrValue.toString().toLowerCase())
        }
      })
    },
    ocWithdraw:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name,modalData.from))
      LnPrint.req.getBitcoinFees((bf)=>{
        $(modalData.id +' .modal-body')
        .append(LnPrint.modal.print.ocWithdrawContent(modalData.from,bf))
        $('#theAmount').on('input change',function(){
          if(Math.sign($(this).val()) === 1 && LnPrint.user.account.balance >= $(this).val()){
            $('#sendCoinsBtn').removeAttr('disabled')
          }else{
            $('#sendCoinsBtn').attr('disabled','disabled')
          }
        })
        $('#sendCoinsBtn').click(()=>{
          $('#sendCoinsBtn').attr('disabled','disabled')
          LnPrint.req.sendOnChain(
            $('#theAddress').val(),
            $('#theAmount').val(),
            $('input[name=fee]:checked').val(),
            modalData.from
          )

        })

        LnPrint.readQR('photoBtn',(err,qrValue)=>{
          if(err){
            return (()=>{
              alert(err)
              //console.log(err)
            })()
          }
          if(qrValue){
            $('#theAddress').val(qrValue.toString().toLowerCase())
          }
        })
      })
    },
    invoice:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name,modalData.from))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.invoiceContent(modalData.payreq,modalData.from))
      //console.log(modalData)
      $(modalData.id).on('hide.bs.modal',function(){
        clearInterval(invoiceExpInterval)
      })
      let invoiceTTL = Date.parse(modalData.payreq.dateE)
      ////console.log('invoiceTTL',invoiceTTL)
      let invoiceExpInterval = setInterval(function() {
        let now = new Date().getTime()
        ////console.log('now:',now)
        let distance = invoiceTTL - now
        //let days = Math.floor(distance / (1000 * 60 * 60 * 24))
        //let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        let seconds = Math.floor((distance % (1000 * 60)) / 1000)
        $("#invoicecountdown").html('EXPIRES IN '+ minutes + "m " + seconds + "s ")
        if (distance < 0) {
          clearInterval(invoiceExpInterval)
          $("#invoicecountdown").html('EXPIRED')
        }
        //clearInterval(invoiceExpInterval)
      }, 1000)
      $('#qrdiv').qrcode({width: 1200,height: 1200, text: modalData.payreq.invoice})
    },
    address:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name,modalData.from))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.addressContent(modalData.addressData,modalData.from,modalData.bitcoinFees))
      LnPrint.req.getBitcoinFees((bitcoinFees)=>{
        $('#suggestedfees').append('suggested fees: fastest '+bitcoinFees.fastestFee+', half hour '+bitcoinFees.halfHourFee+', hour '+bitcoinFees.hourFee)
      })
      $('#qrdiv').qrcode({width: 1200,height: 1200, text: modalData.addressData._id})
    },
    order1:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name,modalData.from))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.order1(modalData.product,modalData.from))
    },
    draftReq:(modalData)=>{
      $(modalData.id +' .modal-content')
      .append(LnPrint.modal.print.commonStructure(modalData.name,modalData.from))
      $(modalData.id +' .modal-body')
      .append(LnPrint.modal.print.draftReq(modalData.product,modalData.from))
      //console.log(modalData)
      LnPrint.req.preset(modalData.product.preset,(preset)=>{
        $('.draftreq-form').formRender({formData: preset.formData})
        $('.formBuilder-injected-style').remove();
      })
    }
  }
}

LnPrint.modalSpooler = {
  cycle: {},
  start: ()=>{
    LnPrint.modalSpooler.active = true
    LnPrint.modalSpooler.cycle = setInterval(function () {
      // console.info('#!!-modal spooler interval- modal action queue:', modal.action.queue)
      // console.info('#!!-modal spooler interval- modals active:', modal.active)
      // console.info('#!!-modal spooler interval- modal busy:',modal.busy)
      LnPrint.modalSpooler.active = true
      if(LnPrint.modal.action.queue.length > 0){
        var queueToDo = LnPrint.modal.action.queue[0]
        LnPrint.modal.action.spooler(queueToDo.action, queueToDo.data, queueToDo.cb)
      }
    }, 200)
  },
  stop: ()=>{
    LnPrint.modalSpooler.active = false
    clearInterval(LnPrint.modalSpooler.cycle)
  },
  active: false
}

LnPrint.modalSpooler.start()
