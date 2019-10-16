function createObserver(){
  var steps = []
  for(var i=0;i <= 100;i++){
    var num = (1/100)*i
    var n = Number(num.toFixed(3))
    steps.push(n)
  }
  var observer
  var observerOptions = {threshold: steps}
  observer = new IntersectionObserver(handleIntersect, observerOptions)
  observer.observe(document.querySelector("#logobig"))
}

function trans(input1,output1){
  console.log('trans.. stickyBarHyster: ', stickyBarHyster)
  var pixelDivWidth = $('#navbarcontentdiv').width() - $('#navicons').outerWidth()
  var spostamentopx = output1*pixelDivWidth
  var pxremaining = (1-output1)*pixelDivWidth
  //ON MOBILE ICONS TRANSITION
  if(mobile()){ //ONLY MOBILE
    $('#navicons').css('margin-right',spostamentopx+'px')
  }else{
    $('#navicons').css('margin-right','0px')
  }
  // TRANSITION FROM LEFT TO CENTER
  if (input1 > 0.5){//SOPRA
    if (stickyBarHyster){
      console.log('FAI COSE POI stickyBarHyster = false')
      $('#logosmalla').css('display', 'none')
      $('#navbarlinks').collapse('hide')
      $('#navButtons').css('text-align','left')
      $('#hamburger').css('order',0)
      $('#userandbell').css('order',1)
      $('#navicons').css('order',1)
      $('#navbarlinks').css('order',0)
      $('#navbarcontentdiv').css('justify-content','flex-end')
      if(mobile()){ //ONLY MOBILE
        $('#navbarlinks').css('margin-top','-'+navLinkShift+'px')
        $('#navicons').css('justify-content','flex-start')
      }else{
        $('#navbarlinks').css('margin-top',0)
        $('#navButtons').css('padding-left',0)
        $('#navicons').css('justify-content','flex-end')
      }
      $('#navbarlinks').on('shown.bs.collapse', function() {
        $('#naviga').css('margin-top','-80px')
      })
      $('#navbarlinks').on('hidden.bs.collapse', function() {
        $('#naviga').css('margin-top','0px')
      })
      $('#logosmall').css('opacity', "0")
      $('#navButtons').css('padding-right',0)
      stickyBarHyster = false
    }
    if(mobile()){

      $('#navButtons').css('padding-left',pxremaining+'px')
    }
  }
  //TRANSITION FROM CENTER TORIGHT
  if (input1 <= 0.5){ //SOTTO
    if(!stickyBarHyster){
      console.log('FAI COSE POI stickyBarHyster = true')
      $('#navbarlinks').collapse('hide').css('margin-top','0px')
      $('#navButtons').css('text-align','right')
      $('#hamburger').css('order',1)
      $('#userandbell').css('order',0)
      $('#navicons').css('justify-content','flex-end')
      if(mobile()){ //ONLY MOBILE
        $('#navicons').css('order',0)
        $('#navbarlinks').css('order',1)
        $('#navbarcontentdiv').css('justify-content','space-between')
      }else{
        $('#navButtons').css('padding-right',0)
        $('#navicons').css('order',1)
        $('#navbarlinks').css('order',0)
      }
      $('#navbarlinks').on('shown.bs.collapse', function() {
        $('#naviga').css('margin-top','0px')
      })
      $('#navButtons').css('padding-left',0)
      stickyBarHyster = true
    }
    if(mobile()){ //ONLY MOBILE
      $('#navButtons').css('padding-right',spostamentopx+'px')
    }
    var height = 35*(1-(input1/0.5))
    var opylogoB =Math.pow((1-(input1/0.5)),2)
    $('#logosmalla').css('display', 'flex')
    $('#logosmall').css('opacity', opylogoB).css('height',height)
  }
}

function handleIntersect(entries, observer){
  entries.forEach(entry => {
    transy = entry.intersectionRatio
    transx = 0.5*(1 - Math.cbrt(1-2*transy)) //ARGHH
    console.log('trans handleintersect')
    trans(transy,transx)
  })
}
