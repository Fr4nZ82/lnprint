// window.onerror = function(error, url, line) { //used for debugging on apple mobile devices
//     alert('error: '+error+'  line: '+line) 
// }

var ioSock = io()
ioSock.on('connect',function(){
  //console.log('NUOVO SOCKET CONNESSO:',ioSock)
})
ioSock.on('disconnect',function(){
  //console.log('#!!-onLoad- socket disconnesso:',ioSock)
})

//DEPOSIT EVENTS
ioSock.on('deposit_done', function (socketData) {
  //console.log('#!!-onLoad- socket emit deposit_done:',socketData)
  //console.log('#!!-onLoad- deposit FULMINE!!!')
  LnPrint.modal.new({name: 'fulmine',from: 'eventDeposit', paymentData: 'none',autoclose:true})
  Udata.user.account.balance += socketData.amt
  socketData.date = new Date(socketData.date)
  Udata.user.account.history.push(socketData)
  Udata.user.account.payreq.forEach(function(payreq,index){
    if(payreq._id == socketData.payreq){
      //console.log('#!!-onLoad- elimino da Udata.user.account.payreq la payreq con id',payreq.id)
      if (index > -1) {
        Udata.user.account.payreq.splice(index, 1)
      }
    }
  })
  if(thisPageName == 'dashboard'){
    LnPrint.redraw()
  }
})
ioSock.on('ocdeposit_done', function (socketData) {
  //console.log('#!!-onLoad- socket emit ocdeposit_done:',socketData)
  Udata.user.account.balance += socketData.amt
  socketData.date = new Date(socketData.date)
  Udata.user.account.ochistory.push(socketData)
  LnPrint.notifyMsg({type:'msg',text:'onchain payment received!'},()=>{
    if(thisPageName == 'dashboard'){
      LnPrint.redraw()
    }
  })
})

//WITHDRAW EVENTS
ioSock.on('withdraw_done', function (socketData) {
  //console.log('#!!-onLoad- socket emit withdraw_done:',socketData)
  //console.log('#!!-onLoad- withdraw FULMINE!!!')
  LnPrint.modal.new({name: 'fulmine', from: 'eventWithdraw', paymentData: socketData,autoclose:true})
  Udata.user.account.balance -= socketData.amt
  socketData.date = new Date(socketData.date)
  Udata.user.account.history.push(socketData)
  if(thisPageName == 'dashboard'){
    LnPrint.redraw()
  }
})
ioSock.on('withdraw_fail', function (socketData) {
  //console.log('#!!-onLoad- socket emit withdraw_fail:',socketData)
  //console.log('#!!-onLoad- withdraw notify error')
  LnPrint.notifyMsg(socketData.LnPrint.notifyMsg,a=>LnPrint.modal.close(2))
})

//CHANNELS DISCLOSURE EVENT
ioSock.on('channels_disclosure', function (socketData) {
  //console.log('#!!-onLoad- socket emit channels_disclosure:',socketData)
  Udata.user.account.userRemotePubkeys=socketData
  if(thisPageName == 'dashboard'){
    LnPrint.redraw()
  }
})

//INSTALL PROMPT
$('#addAppBtn').hide()
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later.
  deferredPrompt = e
  // Update UI notify the user they can add to home screen
  $('#addAppBtn').show()
})

$('#addAppBtn').on('click', (e) => {
  // hide our user interface that shows our A2HS button
  $('#addAppBtn').hide()
  // Show the prompt
  deferredPrompt.prompt()
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        //console.log('User accepted the A2HS prompt')
      } else {
        //console.log('User dismissed the A2HS prompt')
      }
      deferredPrompt = null
    })
})


//HIDE BACKLOADING IF SECOND ATTEMPT FAIL
setTimeout(function () {
  $('#backLoading').animate({
    opacity: 0,
  }, 100, function() {
    $('#backLoading').hide()
  })
}, 8000)

//ONLOAD SCRIPT
window.addEventListener("load", function(event) {
  //console.log('#!!-onLoad- Pagina caricata completamente')

  //HIDE BACKLOADING IF FIRST ATTEMPT FAIL
  setTimeout(function () {
    $('#backLoading').animate({
      opacity: 0,
    }, 100, function() {
      $('#backLoading').hide()
    })
  }, 1000)

  //SERVICE WORKER
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      // Registration was successful
      //console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function(err) {
      // registration failed :(
      //console.log('ServiceWorker registration failed: ', err)
    })
  }


  //RELOAD CONTROL
  if(window.performance){
    //console.log('#!!-onLoad- controllo se il server mi chiede di tornare alla home')
    if(goHome == 'yes'){
      //console.log('#!!-onLoad- si, torno alla home')
      location.replace('/')
    }else{
      //console.log('#!!-onLoad- controllo se la pagina è stata aggiornata')
      if(performance.navigation.type==0){
        //console.log('#!!-onLoad- è una nuova pagina quindi')
        Udata.page.first = 'yes'
        //console.log('#!!-onLoad- Richiesta post / con data',Udata)
        LnPrint.post(Udata.page,(res)=>{
          //console.log("#!!-onLoad reqUserData- questa è la risposta del server:",res)
          //console.log("#!!-onLoad reqUserData- ricarico la pagina (/)")
          location.reload()
        })
      }else{
        //console.log('#!!-onLoad- è una pagina aggiornata, richiedo al server i dati utente...')
        LnPrint.req.getUserData((response)=>{
          LnPrint.conf = response.conf
          if(response.user._id !== undefined && response.user._id != ''){
            if(socketConnected == 'yes'){
              //console.log('socket is connected')
            }else{
              //console.log('socket is not connected')
            }
            Udata.user = response.user
            Udata.user.account.history.forEach((tx,i)=>{
              ////console.log('a'+Udata.user.account.history[i].date)
              Udata.user.account.history[i].date = new Date(Number(tx.date.toString()))
              ////console.log('b',Udata.user.account.history[i].date)
            })
            Udata.user.summary = {
              mes: ()=>{return 'ToDo'},
              fou: ()=>{return Udata.user.account.balance},
              wor: ()=>{return 'ToDo'},
              shi: ()=>{return 'ToDo'}
            }

            //console.log('#!!-onLoad- SUMMARY:',Udata.user.summary)

            //DRAW PAGES
            if(response.user.admin === true && thisPageName != 'admin'){
              $('#navButtons')
              .append('<li class="nav-item"><a id="adminNav" class="nav-link" href="/admin">Admin</a></li>')
            }
            if(thisPageName == 'dashboard'){
              LnPrint.dashboard.draw.overview(Udata.user)
            }
            if(thisPageName == 'admin'){
              LnPrint.admin.draw.overview(Udata.user)
            }
          }else{
            //console.log('#!!-onLoad- NON ESISTE')
            if(!!Udata.user){
              delete Udata.user
            }
          }
          if(thisPageName == 'products'){
            $('body').css('overflow','hidden')
            LnPrint.products.draw.list()

          }

          //STICKYBAR OBSERVER
          if($('#logobig').length){
            createObserver()
          }else{
            $('#logosmall').css('opacity', '1').css('height','35')
            $('#logosmalla').css('display','flex')
          }
          setTimeout(function () {
            if(transy <= 0.5){
              stickyBarHyster = false
            }
            LnPrint.adjust(thisPageName)
          }, timeouts)
          $(window).resize(()=>{
            if(stickyBarHyster){stickyBarHyster = false}else{stickyBarHyster = true}
            LnPrint.adjust(thisPageName)
          })


          //STYCKY FOOTER



        })
        ////console.log('thisPageName: ',thisPageName)
        mobile = ()=>{
          if($('#hamburger').css('display') != 'none'){
            return true
          }else{
            return false
          }
        }



        //GET LAZY LOADED SCRIPT
        $.getScript( '/js/plugin/bitcoinjs.bundle.min.js', function(){
          Udata.bitcoinReady = true
        })
        $.getScript( '/js/plugin/jquery.qrcode.min.js', function() {
          Udata.qrcodeReady = true
        })

        //PREPARE MODALS TO START AND ADJUST THE PAGE WHEN MODAL OPEN :_D
        let noForever = 0
        setInterval(function(){
          if(LnPrint.modal.busy > 0){
            noForever++
            if(noForever > 30){
              //console.log('!!!!!!!!!!!!!!!!!!modal busy forever! Close all modals and set it to 0')
              LnPrint.modal.action.queue = []
              LnPrint.modal.busy = 0
              noForever = 0
              if(thisPageName == 'dashboard'){
                LnPrint.redraw()
              }
              LnPrint.modal.close('all',()=>{alert('sry, something crashed and modals results busy for too long time')})
            }
          }else{
            noForever = 0
          }
        },300)
        $(document).on('show.bs.modal', function (event) {
          //console.log('#!!-onLoad- on opening modal event:',event)
          var modalData = event.relatedTarget
          //console.log(modalData.name)
          LnPrint.modal.draw[modalData.name](modalData)
        })

        //REMOVE FOCUS FROM HAMBURGER - probably there is a css property for that :_D
        $('#navbarlinks').on('shown.bs.collapse', ()=>{
          $('#hamburger').blur()
        })
        $('#navbarlinks').on('hidden.bs.collapse', ()=>{
          $('#hamburger').blur()
        })

        //CLOSE NAVBAR COLLAPSE WHEN CLICK A LINK
        if(mobile()){
          $('.nav-link').on('click',()=>{
            //console.log('#!!-onLoad- closing collapse navbar')
            $('#navbarlinks').collapse('hide')
          })
        }
      }
    }
  }
})
