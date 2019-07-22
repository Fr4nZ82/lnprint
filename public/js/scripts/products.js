LnPrint.products = {
  draw:{
    list: ()=>{
      LnPrint.products.cache = []
      LnPrint.req.products((products)=>{
        //console.log(products)
        LnPrint.clear.contentWrapper()
        LnPrint.draw.drawingspace()
        LnPrint.draw.row(0)
        LnPrint.draw.column(0,'productscolumn',12)
        $('#productscolumn').append(LnPrint.products.print.productsTable(products))

        var mouseExitTimeout, showingIn, blinkTimeout, mouseHoverActive = false,
            mouseExitTime = 1500,
            mouseEnterTime = 700,
            blinkTime = 160,
            scrollTime = 300,
            rowColor = '#fffcb1',
            rowHoverColor = '#c2ffc1',
            resetRowsStyle = ()=>{
              $('#producttable .productrow')
              .stop()
              .removeClass('mousehover')
              .css('background-color',rowColor)
            },
            resetRowsHeight = ()=>{
              $('#producttable .productrow').css('height','41px').removeAttr('this')
              $('.proddetaildiv').remove()
            }

        resetRowsStyle()
        resetRowsHeight()

        var overlayDetail = (pr,el,i)=>{
          resetRowsStyle()
          $(el).attr('this','true')
          let divData = {
            i: i,
            product: pr,
            color: rowHoverColor,
            width: $(el).width(),
            top: $(el).position().top+30,
            left: $(el).position().left+15
          }
          //console.log('append div')
          $('#ptablewrapper').append(LnPrint.products.print.productDetail(divData))
          $(el).height($('#proddetaildiv_'+i).height())

          $('#proddetaildiv_'+i)
          .css('width',$(el).width())
          .css('top',$(el).position().top+30)
          .css('left',$(el).position().left+15)
          .hover(
            ()=>{
              //console.log('mouse enter div')
              clearInterval(mouseExitTimeout)
              resetRowsStyle()
            },
            ()=>{
              //console.log('mouse exit div')
              clearTimeout(mouseExitTimeout)
              //console.log('timeout 810')
              mouseExitTimeout = setTimeout(function () {
                //console.log('div close')
                resetRowsHeight()
              }, mouseExitTime)
            }
          )
          .dblclick(()=>{
            $('.proddetaildiv').unbind('mouseleave').unbind('mouseenter')
            $('#producttable .productrow').unbind('mouseleave')
          })

          $('#content-wrapper')
          .animate(
            {
              scrollTop: $(el).position().top},
            {
              duration:scrollTime,
              start:()=>{resetRowsStyle()},
              complete :()=>{resetRowsStyle()}
            }
          )

          $('.photoclick').click(()=>{
            LnPrint.products.draw.photoPreview(pr.id,toggleMouseHover)
          })

          $('.thetagdiv')
          .on('click mouseenter',function(){
            let tags = pr.tags.replace(/,/g, " ")
            //console.log('show tag')
            $(this).append('<div class="tagslistdiv">'+tags+'</div>')
            $('.tagslistdiv')
            .css('z-index',99999)
            .css('top',$('.thetagdiv').offset().top-40)
            .css('left',$('.thetagdiv').offset().left-3)
            setTimeout(function () {
              $('body').on('click scroll',function(){
                //console.log('hide tag')
                $('body').off()
                $('.tagslistdiv').remove()
              })
            }, 10)
          })
          .on("mouseleave",function(){
            $('.tagslistdiv').remove()
          })

          if(pr.description.length > 200){
            $('.pddesc').hover(()=>{
              $('.pddesc')
              .css('background-color','rgba(255, 255, 255, 0.45)')
              .css('cursor', 'pointer')
            },()=>{
              $('.pddesc')
              .css('background-color','rgba(255, 255, 255, 0)')
            }).click(()=>{
              $('.pddesc')
              .text(pr.description)
              .css('cursor','auto')
              .css('background-color','rgba(255, 255, 255, 0)')
              .off()
              $('#proddetaildiv_'+i)
              .css('width',$(el).width())
              .css('top',$(el).position().top+30)
              .css('left',$(el).position().left+15)
              $(el).css('height',$('#proddetaildiv_'+i).height())
            })
          }
          let draft = false
          if(pr.draftPrice > 0 || pr.readyToSell < 1){
            $('.orderProductButton').text('request draft...')
            draft = true
          }

          if(LnPrint.user){
            $('.orderProductButton').click(()=>{
              //console.log('click',LnPrint.products.cache)
              toggleMouseHover(false,true)
              if(draft){
                LnPrint.modal.new({name:'draftReq',from:'productTable',product:pr,onClose:()=>{toggleMouseHover(false,false)}})
                // LnPrint.req.genInvoice(amount,from,(res)=>{
                //   LnPrint.modal.new({name:'invoice',from:'draftreq',payreq:res,onClose:()=>{toggleMouseHover(false,false)}})
                // })
              }else{
                LnPrint.modal.new({from:'order',name:'order1',product:pr,onClose:()=>{toggleMouseHover(false,false)}})
              }
            })
          }else{
            $('.orderProductButton')
            .attr('disabled','true')
            $('.orderProductButton')
            .parent()
            .append('<div class="helpertexttrigger" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>')
            $('.helpertexttrigger').hover(
              function(){
                $(this).append('<div class="helpertext">only authenticated user can order products</div>')
                $('.helpertext')
                .css('z-index',99999)
                .css('top',$('.orderProductButton').offset().top-55)
                .css('left',$('.orderProductButton').offset().left-3)
              },function(){
                $('.helpertext').remove()
              }
            )
          }

        }

        function toggleMouseHover(removeDiv,force){
          var mHV = force || mouseHoverActive
          if(!mHV){
            if(removeDiv){
              resetRowsHeight()
            }
            //console.log('set hovers')
            $('#producttable .productrow').each(function(i){
              var _this = this
              $(_this).on('mouseenter click',function(e){
                //console.log('e',e)
                //console.log('hover on row ',$(_this).attr('pid'))
                //console.log('clear showing in')
                $(_this).addClass('mousehover')
                clearTimeout(showingIn)
                clearTimeout(mouseExitTimeout)
                function blink(elem,bTime){
                  elem
                  .animate({'backgroundColor':rowColor},bTime)
                  .animate({'backgroundColor':rowHoverColor},bTime)
                }
                if(e.type != 'click'){
                  if ($(_this).hasClass('mousehover')){
                    $(_this)
                    .animate({'backgroundColor':rowHoverColor},{
                      duration:300,
                      start:()=>{$(_this).on('mouseleave',()=>{
                        $(_this).stop()
                        .animate({'backgroundColor':rowColor},200)})
                        .removeClass('mousehover')
                      },
                      complete:()=>{
                        //console.log('complete')
                        var halfblink = blinkTime / 2
                        //console.log(halfblink)
                        blink($(_this),halfblink)

                        blinkTimeout = setInterval(function (){
                          //console.log('interval')
                          if ($(_this).hasClass('mousehover')){
                            blink($(_this),halfblink)
                          }else{
                            $(_this)
                            .stop()
                            .animate({'backgroundColor':rowColor},halfblink)
                            clearInterval(blinkTimeout)
                          }
                        }, blinkTime)
                      }
                    })
                  }

                  mouseExitTimeout = setTimeout(function () {
                    //console.log('div close')
                    resetRowsHeight()
                  }, mouseExitTime)
                  var thisTimeOutTime = mouseEnterTime
                }else{
                  var thisTimeOutTime = 200
                }
                //console.log('timeout 800')
                showingIn = setTimeout(function () {

                  toggleMouseHover(false,true)
                  $(_this).css('height','150px')
                  resetRowsHeight()
                  var pindex = (products.map(p=>p.id)).indexOf($(_this).attr('pid'))
                  if(pindex != -1){
                    var _product = products[pindex]
                    var cpindex = (LnPrint.products.cache.map(pc=>pc.id)).indexOf(_product.id)

                    if(cpindex != -1){
                      //console.log('product in cache:',LnPrint.products.cache[cpindex])
                      _product = LnPrint.products.cache[cpindex]
                      overlayDetail(_product,_this,i)
                      toggleMouseHover(false,false)
                    }else{

                      LnPrint.req.product(_product.id,false,(response)=>{
                        //console.log('product from server:',response)
                        _product = response
                        LnPrint.products.cache.push(_product)
                        LnPrint.products.cache.splice(50)
                        overlayDetail(_product,_this,i)
                        toggleMouseHover(false,false)
                      })
                    }

                  }else{
                    LnPrint.notifyMsg({type:'alert',text:'this product does not exist... sorry,<br>try to refresh the page'})
                  }
                }, thisTimeOutTime)
              })
              .on('mouseleave',function(){
                //console.log('mouse exit from row ',$(_this).attr('pid'))
                //console.log('clear showing in')
                clearTimeout(showingIn)
                $(_this).removeClass('mousehover')
              })
            })
            mouseHoverActive = true
          }else{
            //console.log('unset hover')
            $('#producttable .productrow').each(function(){
              $(this).off()
            })
            $('.proddetaildiv').unbind('mouseenter').unbind('mouseleave')
            mouseHoverActive = false
          }
        }

        toggleMouseHover(true)
      })
    },
    photoPreview:(pId,toggleMouseHover)=>{
      toggleMouseHover(false)
      LnPrint.draw.overlay('productPhotoPreview',false,false,false)
      LnPrint.draw.oRow(0,'productPhotoPreview')
      LnPrint.draw.oRow(1,'productPhotoPreview')
      LnPrint.draw.oColumn(0,'productPhotoPreviewColumn',12)
      LnPrint.draw.oColumn(1,'productPhotoPreviewCommandsColumn',12)
      $('.overlayWC').css('background-color','#000000')
      LnPrint.req.product(pId,true,(p)=>{
        if(p.photos.length > 0){
          $('#productPhotoPreview_overlayDS').css('height','100%')
          $('#oRow0').css('height','90%')
          $('#oRow1').css('height','10%')
          $('#productPhotoPreviewColumn').append(LnPrint.products.print.carousel(p.photos))
          $('#photoPreviewCarousel').css('height','100%')
          $('#productPhotoPreviewCommandsColumn').append(`<button id="closeProductPreview" class="btn">close</button>`)
          $('#closeProductPreview').click(()=>{
            $('#productPhotoPreview_overlay').remove()
            setTimeout(function () {
              toggleMouseHover(false)
            }, 10);
          })
        }else{
          //Notify no photos and close preview
        }
      })

    }
  },
  cache: []
}
