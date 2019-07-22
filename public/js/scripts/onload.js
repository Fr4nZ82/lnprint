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
  LnPrint.user.account.balance += socketData.amt
  socketData.date = new Date(socketData.date)
  LnPrint.user.account.history.push(socketData)
  LnPrint.user.account.payreq.forEach(function(payreq,index){
    if(payreq._id == socketData.payreq){
      //console.log('#!!-onLoad- elimino da LnPrint.user.account.payreq la payreq con id',payreq.id)
      if (index > -1) {
        LnPrint.user.account.payreq.splice(index, 1)
      }
    }
  })
  if(LnPrint.page == 'dashboard'){
    LnPrint.redraw()
  }
})
ioSock.on('ocdeposit_done', function (socketData) {
  LnPrint.user.account.balance += socketData.amt
  socketData.date = new Date(socketData.date)
  LnPrint.user.account.ochistory.push(socketData)
  LnPrint.notifyMsg({type:'msg',text:'onchain payment received!'},()=>{
    if(LnPrint.page == 'dashboard'){
      LnPrint.redraw()
    }
  })
})
ioSock.on('ocdeposit_fail', function(socketData) {
  LnPrint.notifyMsg(socketData.message)
})

//WITHDRAW EVENTS
ioSock.on('withdraw_done', function (socketData) {
  LnPrint.modal.new({name: 'fulmine', from: 'eventWithdraw', paymentData: socketData,autoclose:true})
  LnPrint.user.account.balance -= socketData.amt
  socketData.date = new Date(socketData.date)
  LnPrint.user.account.history.push(socketData)
  if(LnPrint.page == 'dashboard'){
    LnPrint.redraw()
  }
})
ioSock.on('withdraw_fail', function (socketData) {
  LnPrint.notifyMsg(socketData.message,()=>{LnPrint.modal.close(all)})
})

//ONPOPSTATE EVENT
window.onpopstate = (event)=>{
  if(event.state != null){
    if(event.state.stateNumber > -1){
      console.log('popstate',event)
      let stateNumber = event.state.stateNumber,
          args = LnPrint.snapshots[stateNumber].args || []
      if(LnPrint.snapshots[stateNumber]){
        LnPrint.snapshotToFunction(LnPrint.snapshots[stateNumber].func,(func)=>{
          LnPrint.pushHistorySwitch = false
          console.log('onpopstate call func:',func)
          func(...args)          
        })
      }else{
        LnPrint.req.changepage('home')
        location.reload()
      }
    }else{
      console.log('stateNumber is undefined')
    }
  }else{
    console.log('popevent is null?',event)
  }
}

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
  console.log('page loaded')
  LnPrint.loading.hide()
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
    }, function(err) {
      //console.log(err)
    })
  }
  
  //get data from server and draw pages
  LnPrint.update(()=>{
    //insteadd of pushing a state, the first time the state must be replaced
    LnPrint.pushHistorySwitch = false
    LnPrint.drawPage(()=>{
      let ssSnapshotsJson = window.sessionStorage.getItem('snapshots') || false
      this.console.log('ssSnapshotsJson',ssSnapshotsJson)
      let ssSnapshots
      if(ssSnapshotsJson){
        ssSnapshots = JSON.parse(ssSnapshotsJson)
      }else{
        ssSnapshots = false
      }
      console.log('ssSnapshot',ssSnapshots)
      if(ssSnapshots && ssSnapshots.length > 0){
        console.log('ssSnapshot is not false and its length is > 0')
        LnPrint.snapshots = ssSnapshots
      }else{
        console.log('ssSnapshot is false or void, push a new snapshot of the current page and save sessionstorage')
        LnPrint.snapshots.push({func: ['req','changepage'], args: [LnPrint.page]})
        window.sessionStorage.setItem('snapshots',JSON.stringify(LnPrint.snapshots))
      }
      console.log('replace state on load')
      window.history.replaceState({stateNumber: LnPrint.snapshots.length-1},LnPrint.page,'/')
    })

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
$(document).on('show.bs.modal', function (event) {
  //console.log('draw modal')
  var modalData = event.relatedTarget
  LnPrint.modal.draw[modalData.name](modalData)
})
let noForever = 0
setInterval(function(){
  if(LnPrint.modal.busy > 0){
    noForever++
    if(noForever > 30){
      LnPrint.modal.action.queue = []
      LnPrint.modal.busy = 0
      noForever = 0
      LnPrint.modal.close('all',()=>{alert('sry, something crashed and modals results busy for too long time')})
      location.reload()
    }
  }else{
    noForever = 0
  }
},300)

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