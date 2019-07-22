//ADJUST THINGS ON LOAD AND ON RESIZE
LnPrint.adjust = (pag)=>{
  navLinkShift = ($('#navButtons').find('li').length - 2)*40
  //console.log('adjust..')
  if(pag == 'dashboard' || pag == 'products' || pag == 'admin'){
    $('#navbarlinks').collapse('hide')
    $('#navbarlinks').on('shown.bs.collapse', ()=>{
      $(".thesidebar").css("display",'flex')
      $('#footer').css('border-top-left-radius','0')
    });
    $('#navbarlinks').on('hidden.bs.collapse', ()=>{
      $(".thesidebar").css("display",'none')
      $('#footer').css('border-top-left-radius','20px')
    });
    if($('#wrapper').length){
      var heightMinusNavbar2 = window.innerHeight - $('#naviga').outerHeight() - $('#footer').outerHeight()
      $('.wrapper').css('height',heightMinusNavbar2 + 'px')
      $('.thesidebar').css('height',heightMinusNavbar2 + 'px !important')
    }
    if($('#wrapper').height() < 340){  // MAX WRAPPER HEIGHT WITH SCROLLBAR VISIBLE
      $('.thesidebar').css('overflow-y','auto').css('overflow-x','hidden')
    }else{
      $('.thesidebar').css('overflow','hidden')
    }
    if($('.proddetaildiv').length){
      let pid = $($('.proddetaildiv')[0]).attr('pid')
      let $row = $('.productrow[pid='+pid+']')
      $('.proddetaildiv')
      .css('width',$row.width())
      .css('left',$row.position().left+15)
      .css('top',$row.position().top+30)
      $('.productrow[this]').css('height',$($('.proddetaildiv')[0]).height())
    }
    if(mobile()){
      $('#navbarlinks').on('shown.bs.collapse', ()=>{$(".wrapper").css("height",'calc(100vh - 138px)')})
      $('#navbarlinks').on('hidden.bs.collapse', ()=>{$(".wrapper").css("height",'calc(100vh - 58px)')})
      if( $('#navbarlinks').css('display') == 'none' ){
        $(".thesidebar").css("display",'none');
        $('#footer').css('border-top-left-radius','20px')
      }
      $('#userandbell').css('margin-right','12px').css('order',0);
      $('#navicons').css('order',0);
      $('#navbarlinks').css('order',1);
      $('#navButtons').css('text-align','right');
      $('#hamburger').css('order',1);
    }else{
      $(".thesidebar").css("display",'flex');
      $('#footer').css('border-top-left-radius','0')
      $('#navbarcontentdiv').css('padding',0);
      $('#userandbell').css('margin-right',0).css('order',1);
      $('#navicons').css('order',1);
      $('#navbarlinks').css('order',0);
      $('#navButtons').css('text-align','left');
      $('#hamburger').css('order',0);
    }
  }else{
    //ADJUST LOGOBIG BANNER HEIGHT FOR ALL DEVICES
    if($('#logobig').length){
      var heightMinusNavbar = window.innerHeight - $('#naviga').outerHeight() - $('#footer').outerHeight();
      $('#logobig').css('height',heightMinusNavbar + 'px');

    }
    //console.log('trans!!!!!!!!!!!!!')
    trans(transy,transx)
  }
  //$('#backLoading').hide()
}

LnPrint.drawPage = (cb)=>{
  cb = cb || noop
  console.log('drawPage, snapshots:',LnPrint.snapshots)
  LnPrint.clear.page()

  $('#mainwrapper').append(LnPrint.pagesParts.navbar())

  if(LnPrint.page == 'home'){
    $('body').css('overflow','auto')
    $('#naviga').before(LnPrint.pagesParts.intestation())
    $('#naviga').after(LnPrint.pagesParts.home())
  }
  if(LnPrint.page == 'products'){
    $('body').css('overflow','hidden')
    $('#naviga').after(LnPrint.pagesParts.products())
    LnPrint.products.draw.list()
  }
  if(LnPrint.page == 'dashboard'){
    $('body').css('overflow','auto')
    $('#naviga').after(LnPrint.pagesParts.dashboard())
    LnPrint.dashboard.draw.overview(LnPrint.user)
  }
  if(LnPrint.isAdmin === true){
    if(LnPrint.page == 'admin'){
      $('body').css('overflow','auto')
      $('#naviga').after(LnPrint.pagesParts.admin())
      LnPrint.admin.draw.overview()
    }else{
      $('#navButtons').append(`
        <li class="nav-item">
        <a id="adminNav" class="nav-link" href="javascript:void(0);"
        onclick="LnPrint.req.changepage('admin');">Admin</a></li>
      `)
    }
  }

  if($('#logobig').length){
    createObserver()
  }else{
    $('#logosmall').css('opacity', '1').css('height','35')
    $('#logosmalla').css('display','flex')
  }
  LnPrint.adjust(LnPrint.page)
  LnPrint.saveHistory({func: LnPrint.req.changepage, args:[LnPrint.page]})
  cb()
}

LnPrint.update = (cb)=>{
  LnPrint.req.getUserData((response)=>{
    if(response.user){

      LnPrint.isAdmin = response.user.admin || false
      LnPrint.page = response.page.name
      LnPrint.conf = response.conf

      if(response.user._id !== undefined && response.user._id != ''){
        LnPrint.loggedUser = true
        LnPrint.user = response.user

        //fix date format for each tx in the user account history
        LnPrint.user.account.history.forEach((tx,i)=>{
          LnPrint.user.account.history[i].date = new Date(Number(tx.date.toString()))
        })

        //create the summary for the overview page
        LnPrint.user.summary = {
          mes: ()=>{return 'ToDo'},
          fou: ()=>{return LnPrint.user.account.balance},
          wor: ()=>{return 'ToDo'},
          shi: ()=>{return 'ToDo'}
        }

      }else{
        LnPrint.loggedUser = false
        if(LnPrint.user){
          delete LnPrint.user
        }
      }
      cb()
      

    }else{
      LnPrint.req.changepage('home')
      location.reload()
    }
    

  })
}

LnPrint.saveHistory = (f)=>{
  if(LnPrint.pushHistorySwitch){
    console.log('saveHistory',history)
  LnPrint.snapshots.push({func: f.func, args: f.args})
  window.history.pushState({stateNumber: LnPrint.snapshots.length-1},LnPrint.page,'/')
  }else{
    console.log('switch off, history not saved')
    LnPrint.pushHistorySwitch = true
  }
}

LnPrint.redraw = ()=>{
  var args = LnPrint.snapshots[LnPrint.snapshots.length-1].args || []
  LnPrint.snapshots[LnPrint.snapshots.length-1].func(...args)
}
//DRAWER
LnPrint.clear = {
  contentWrapper: ()=>{
    if($('.ff_fileupload_hidden').length){
      $('.ff_fileupload_hidden').FancyFileUpload('destroy')
    }
    $('#content-wrapper').empty()
    if(LnPrint.intervals.length){
      //console.log('LnPrint.intervals',LnPrint.intervals)
      LnPrint.intervals.forEach((interval)=>{
        //console.log('interval to clear:',interval)
        clearInterval(interval)
      })
      LnPrint.intervals = []
    }
  },
  page: ()=>{
    if($('.ff_fileupload_hidden').length){
      $('.ff_fileupload_hidden').FancyFileUpload('destroy')
    }
    $('#mainwrapper').empty()
    if(LnPrint.intervals.length){
      //console.log('LnPrint.intervals',LnPrint.intervals)
      LnPrint.intervals.forEach((interval)=>{
        //console.log('interval to clear:',interval)
        clearInterval(interval)
      })
      LnPrint.intervals = []
    }
  }
}
LnPrint.draw = {
  drawingspace: ()=>{
    $('#content-wrapper').append(
      '<div id="drawingspace" class="container-fluid"></div>'
    )
  },
  row: (n)=>{
    $('#drawingspace').append(
      '<div id="drawingrow'+n+'" class="row drawingrow"></div>'
    )
  },
  column: (row,colname,sm)=>{
    $('#drawingrow'+row).append(
      '<div id="'+colname+'" class="col-sm-'+sm+' mb-3 drawingcolumn"></div>'
    )
  },
  overlay: (id,navbar,sidebar,gutters)=>{
    if(navbar){
      $('#content-wrapper').append(
        '<div id="'+id+'_overlay" class="overlay"></div>'
      )
      $('#'+id+'_overlay').append(
        '<div id="'+id+'_overlayNav" style="flex-wrap: nowrap;background-color: #0000;min-height: 65px;"></div>'+
        '<div id="'+id+'_overlayWrap" class="wrapper" style="display:flex;background-color: #0000;"></div>'
      )
    }else{
      $('#thebody').append(
        '<div id="'+id+'_overlay" class="overlay" style="z-index:1022;background-color: #464848;"></div>'
      )
      $('#'+id+'_overlay').append(
        '<div id="'+id+'_overlayWrap" class="fullWrapper" style="margin:0;padding:0;display:flex;background-color: #464848;"></div>'
      )
    }
    if(sidebar){
      $('#'+id+'_overlayWrap').append('<div id="'+id+'_overlaySide" class="thesidebar"></div>')
    }
    $('#'+id+'_overlayWrap').append(
        '<div id="'+id+'_overlayWC" class="overlayWC">'+
          '<div id="'+id+'_overlayDS" class="overlayDS container-fluid">'+
        '</div></div>'
    )
    if(!gutters){
      $('#'+id+'_overlayWC').css('padding',0).css('margin',0)
      $('#'+id+'_overlayDS').css('padding',0).css('margin',0)
    }
    LnPrint.adjust('dashboard')
  },
  oRow: (n,id)=>{
    $('#'+id+'_overlayDS').append(
      '<div id="oRow'+n+'" class="row drawingrow"></div>'
    )
  },
  oColumn:(row,colname,sm)=>{
    $('#oRow'+row).append(
      '<div id="'+colname+'" class="col-sm-'+sm+' mb-3 drawingcolumn"></div>'
    )
  }
}
//Loading frames
LnPrint.loading = {
  show: ()=>{
    $('#backLoading').show().animate({opacity: 1}, 100)
  },
  hide: ()=>{
    setTimeout(function () {
      $('#backLoading').animate({
        opacity: 0,
      }, 200, function() {
        $('#backLoading').hide()
      });
    }, 450);
  }
}

//NOTIFYMSG FORMAT msgData = {type:'msg | alert',text: string}
LnPrint.notifyMsg = (msgData, cb, cbNo)=>{//ALERT & MESSAGE WITH MODAL
  cb = cb || noop
  cbNo = cbNo || noop
  if(msgData && msgData.text){
    if(msgData.type == 'alert' || msgData.type == 'notify'){
      LnPrint.modal.new(
        {
          from: 'notifyMsg',
          name: 'message',
          type: msgData.type,
          text: msgData.text,
          autoclose:true
        },
        (theModal)=>{
          $(theModal).on('hidden.bs.modal',()=>{cb()})
        }
      )
    }else if(msgData.type == 'important'){
      LnPrint.modal.new(
        {
          from: 'notifyMsg',
          name: 'important',
          text: msgData.text,
        },
        (theModal)=>{
          $(theModal).on('hidden.bs.modal',()=>{cb()})
        }
      )
    }else if(msgData.type == 'prompt'){
      LnPrint.modal.new(
        {
          from: 'notifyMsg',
          name: 'prompt',
          text: msgData.text,
          cbYes: ()=>{cb()},
          cbNo: ()=>{cbNo()}
        }
      )
    }
  }else{
    return
  }
}

//Ajax post, actions format: {ifYes: function, ifNo: function, ifErr: function}
LnPrint.post = (_req,actions)=>{
  LnPrint.modal.action.waitResponse('wait')
  actions.ifErr = actions.ifErr || noop
  //console.log('request:',_req)
  $.ajax({
    type: 'POST',
    url: '/',
    data: _req,
    success: function(response){
      //console.log('response:',response)
      LnPrint.modal.action.waitResponse('done')
      LnPrint.loading.hide()
      if(response){
        if(response.message){
          let _msg = response.message
          LnPrint.notifyMsg(
            _msg,
            ()=>{
              if(_msg.type == 'notify' || _msg.type == 'prompt' || _msg.type == 'important'){
                actions.ifYes(response)
              }else if(_msg.type == 'alert'){
                actions.ifErr(response)
              }
            },
            ()=>{
              if(_msg.type == 'prompt'){
                actions.ifNo(response)
              }
            }
          )
        }else{
          actions.ifYes(response)
        }
      }else{
        actions.ifErr()
      }
    }
  })
}

//VALIDATE FORM FUNCTION
LnPrint.validateForm = (fieldsObj,buttonId)=>{
  if(Object.keys(fieldsObj).every(function(k){ return fieldsObj[k] === true })){
    $('#'+buttonId).removeAttr('disabled')
    return true
  }else{
    $('#'+buttonId).attr('disabled','disabled')
    return false
  }
}
//COPY FUNCTION
LnPrint.copyF = (elem,cb)=>{
  cb = cb || noop;
  //console.log('copyfunction avviata')
  $('#'+elem).select();
  try {
    var successful = document.execCommand('copy')
    var msg
    if(successful){
      msg = {text: 'text copied', type: 'notify'}
    }else{
      msg = {text: 'can not copy the key, try to manual copy it', type: 'alert'}
    }
    LnPrint.notifyMsg(msg,cb())
  } catch (err) {
    LnPrint.notifyMsg({type:'alert',text:'Unable to copy text, err: '+err})
  }
}
LnPrint.standardErrorBehavior = ()=>{
  LnPrint.modal.close('all',()=>{
    location.reload()
    $(window).scrollTop(0)
  })
}
LnPrint.scrollToId = (elemId,shift,divToScroll,animTime)=>{
  divToScroll = divToScroll || 'html,body'
  animTime = animTime || 700
  //console.log('#!!-links- scroll a elemento ', $(elemId));
  $(divToScroll).animate(
     {
       scrollTop: $(elemId).offset().top + shift
     }, animTime
   )
}
LnPrint.readQR = (photoBtn,cb)=>{
  $photoBtn = $('#'+photoBtn)
  var selectedDeviceId = false
  const codeReader = new ZXing.BrowserQRCodeReader()
  //console.log('ZXing code reader initialized')
  codeReader.getVideoInputDevices().then((videoInputDevices) => {
    const sourceSelect = document.getElementById('sourceSelect')
    const sSlabel = document.getElementById('sSlabel')
    const videoPreviewDiv = document.getElementById('vpreviewdiv')
    var drawSS = (videoInputDevices)=>{
      if(videoInputDevices.length > 1) {
        sourceSelect.style.opacity = '1'
        sSlabel.style.opacity = '1'
      }
    }
    var hideSS = ()=>{
      sourceSelect.style.opacity = 0
      sSlabel.style.opacity = 0
    }
    if (videoInputDevices.length >= 1) {
      drawSS(videoInputDevices)
      selectedDeviceId = videoInputDevices[videoInputDevices.length-1].deviceId
      videoInputDevices.forEach((element) => {
        const sourceOption = document.createElement('option')
        sourceOption.text = element.label
        sourceOption.value = element.deviceId
        if(selectedDeviceId == element.deviceId){
          //console.log('selected',element.label)
          sourceOption.selected = true
        }
        sourceSelect.appendChild(sourceOption)
      })
      sourceSelect.onchange = () => {
        selectedDeviceId = sourceSelect.value
        $('#resetButton').click()
        LnPrint.loading.show()
        setTimeout(function () {
          $photoBtn.click()
          LnPrint.loading.hide()
          return selectedDeviceId
        }, 1000)
      }
    }else{
      $photoBtn.hide()
      err = 'device has no camera'
      return cb(err)
    }

    var showVPreview = () => {
      drawSS(videoInputDevices)
      $('#vpreviewdiv').attr('style',`display:flex;position:fixed;left:0;top:0;width:100%;height:100%;
                                      z-index:99999;flex-direction:column;flex-wrap:nowrap;
                                      justify-content:space-between;background-color:#000000;`)
      codeReader.decodeFromInputVideoDevice(selectedDeviceId, 'vpreview').then((result) => {
        //console.log(result)
        closeVPreview()
        return cb(null,result)
      }).catch((err) => {
        var noErr = 'TypeError: Argument 1 of CanvasRenderingContext2D.drawImage could not be converted to any of: HTMLImageElement, SVGImageElement, HTMLCanvasElement, HTMLVideoElement, ImageBitmap.'
        if(err.toString() != noErr){
          err = 'decodeFromInputVideoDevice ERROR: ' + err
          return cb(err)
        }
      })
      //console.log(`Started continous decode from camera with id ${selectedDeviceId}`)
    }
    var closeVPreview = () => {
      videoPreviewDiv.style.display = 'none'
      hideSS()
      codeReader.reset()
      //console.log('Reset.')
      return cb(null,false)
    }
    document.getElementById(photoBtn).addEventListener('click', showVPreview)
    document.getElementById('resetButton').addEventListener('click', closeVPreview)
  })
  .catch((err) => {
    $photoBtn.hide()
    err = 'getVideoInputDevices ERROR: ' + err
    return cb(err)
  })
}
LnPrint.genKey = ()=>{
  let keyPair = bitcoinjs.ECPair.makeRandom({});
  let privkeyhex = keyPair.privateKey.toString('hex');
  let privkeybuffer = new bitcoinjs.Buffer.from(privkeyhex, 'hex');
  let privkey = bitcoinjs.wif.encode(128, privkeybuffer, true)
  keyPair = '';
  return privkey;
}
//**dataURL to blob to dataURL**
LnPrint.dataURLtoBlob = (dataurl)=>{
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}
LnPrint.blobToDataURL = (blob, callback)=>{
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}
