// window.onerror = function(error, url, line) { //used for debugging on apple mobile devices
//     alert('error: '+error+'  line: '+line) 
// }

var ioSock = io()

//MESSAGE TO ALL
ioSock.on('messageToAll', function (socketData) {
  LnPrint.modal.close('all',()=>{
    LnPrint.notifyMsg(socketData.message)
  })
})


//DEPOSIT EVENTS
ioSock.on('deposit_done', function (socketData) {
  //console.log('#!!-onLoad- socket emit deposit_done:',socketData)
  //console.log('#!!-onLoad- deposit FULMINE!!!')
  LnPrint.modal.new({name: 'fulmine',from: 'eventDeposit', paymentData: 'none',autoclose: true})
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
  if(LnPrint.page == 'dashboard'){
    LnPrint.redraw()
  }
})
ioSock.on('ocdeposit_done', function (socketData) {
  Udata.user.account.balance += socketData.amt
  socketData.date = new Date(socketData.date)
  Udata.user.account.ochistory.push(socketData)
  LnPrint.notifyMsg({type:'msg',text:'onchain payment received!'},()=>{
    if(LnPrint.page == 'dashboard'){
      LnPrint.redraw()
    }
  })
})

//WITHDRAW EVENTS
ioSock.on('withdraw_done', function (socketData) {
  LnPrint.modal.new({name: 'fulmine', from: 'eventWithdraw', paymentData: socketData,autoclose:true})
  Udata.user.account.balance -= socketData.amt
  socketData.date = new Date(socketData.date)
  Udata.user.account.history.push(socketData)
  if(LnPrint.page == 'dashboard'){
    LnPrint.redraw()
  }
})
ioSock.on('withdraw_fail', function (socketData) {
  LnPrint.notifyMsg(socketData.message,()=>{LnPrint.modal.close(2)})
})


//PROGRESSIVE APP INSTALL PROMPT
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


//ONLOAD SCRIPT
window.addEventListener("load", function(event) {

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
      //Registration was successful
      //console.log('ServiceWorker registration successful with scope: ', registration.scope)
    }, function(err) {
      // registration failed :(
      //console.log('ServiceWorker registration failed: ', err)
    })
  }
  
  //get data from server to draw pages
  LnPrint.req.getUserData((response)=>{
    if(response.user){

      let loggedUser, isAdmin = response.user.admin || false

      LnPrint.page = response.page.name
      LnPrint.conf = response.conf

      if(response.user._id !== undefined && response.user._id != ''){
        loggedUser = true
        Udata.user = response.user

        //fix date format for each tx in the user account history
        Udata.user.account.history.forEach((tx,i)=>{
          Udata.user.account.history[i].date = new Date(Number(tx.date.toString()))
        })

        //create the summary for the overview page
        Udata.user.summary = {
          mes: ()=>{return 'ToDo'},
          fou: ()=>{return Udata.user.account.balance},
          wor: ()=>{return 'ToDo'},
          shi: ()=>{return 'ToDo'}
        }
        
        

      }else{
        loggedUser = false
        if(!!Udata.user){
          delete Udata.user
        }
      }

      $('#backLoading').after(LnPrint.pagesParts.navbar(LnPrint.page,loggedUser,isAdmin))

      if(LnPrint.page == 'home'){
        console.log('home is the page')
        $('#backLoading').after(LnPrint.pagesParts.intestation(loggedUser))
        $('#naviga').after(LnPrint.pagesParts.home(loggedUser))
      }
      if(LnPrint.page == 'products'){
        $('body').css('overflow','hidden')
        $('#naviga').after(LnPrint.pagesParts.products())
        LnPrint.products.draw.list()
      }
      if(LnPrint.page == 'dashboard'){
        $('#naviga').after(LnPrint.pagesParts.dashboard())
        LnPrint.dashboard.draw.overview(Udata.user)
      }

      if(response.user.admin === true){
        if(LnPrint.page == 'admin'){
          $('#naviga').after(LnPrint.pagesParts.admin())
          LnPrint.admin.draw.overview(Udata.user)
        }else{
          $('#navButtons')
        .append(`
          <li class="nav-item">
          <a id="adminNav" class="nav-link" href="javascript:void(0);"
          onclick="LnPrint.req.changepage('admin');">Admin</a></li>
        `)
        }
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
        LnPrint.adjust(LnPrint.page)
      }, timeouts)
      $(window).resize(()=>{
        if(stickyBarHyster){stickyBarHyster = false}else{stickyBarHyster = true}
        LnPrint.adjust(LnPrint.page)
      })

      
    }else{
      LnPrint.req.changepage('home')
    }
    

  })
  
})
//SET MOBILE FUNCTION
mobile = ()=>{
  if($('#hamburger').css('display') != 'none'){
    return true
  }else{
    return false
  }
}
//GET LAZY LOADED SCRIPT
$.getScript( '/js/plugin/bitcoinjs.bundle.min.js', function(){
  LnPrint.bitcoinReady = true
})
$.getScript( '/js/plugin/jquery.qrcode.min.js', function() {
  LnPrint.qrcodeReady = true
})

//PREPARE MODALS TO START AND CONTROL THAT MODALS IS NOT BUSY FOREVER
let noForever = 0
setInterval(function(){
  if(LnPrint.modal.busy > 0){
    noForever++
    if(noForever > 30){
      LnPrint.modal.action.queue = []
      LnPrint.modal.busy = 0
      noForever = 0
      if(LnPrint.page == 'dashboard'){
        LnPrint.redraw()
      }
      LnPrint.modal.close('all',()=>{alert('sry, something crashed and modals results busy for too long time')})
    }
  }else{
    noForever = 0
  }
},300)

$(document).on('show.bs.modal', function (event) {
  console.log('draw modal')
  var modalData = event.relatedTarget
  LnPrint.modal.draw[modalData.name](modalData)
})

//REMOVE FOCUS FROM HAMBURGER WHEN NAVBAR COLLAPSE
$('#navbarlinks').on('shown.bs.collapse hidden.bs.collapse', ()=>{
  $('#hamburger').blur()
})

//COLLAPSE NAVBAR WHEN CLICK A LINK
if(mobile()){
  $('.nav-link').on('click',()=>{
    $('#navbarlinks').collapse('hide')
  })
}