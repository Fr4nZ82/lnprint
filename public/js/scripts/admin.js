LnPrint.admin = {
  post:{
    formSubmit: noop
  },
  draw:{
    overview: (userData)=>{                                                     //DRAW OVERVIEW
      let summary = userData.summary
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace()
      LnPrint.draw.row(0)
      LnPrint.draw.column(0,'mescolumn',6)
      LnPrint.draw.column(0,'foucolumn',6)
      LnPrint.draw.column(0,'worcolumn',6)
      LnPrint.draw.column(0,'shicolumn',6)

      $('#mescolumn').append(LnPrint.admin.print.overviewCard('mes',summary.mes()+' new messages'))
      $('#foucolumn').append(LnPrint.admin.print.overviewCard('fou',summary.fou()+' satoshis'))
      $('#worcolumn').append(LnPrint.admin.print.overviewCard('wor',summary.wor()+' active works'))
      $('#shicolumn').append(LnPrint.admin.print.overviewCard('shi',summary.shi()+' shipments'))
    },
    messages: (userData)=>{                                                     //DRAW MESSAGES
      let messages = userData.messages
      LnPrint.clear.contentWrapper()
      //LnPrint.saveHistory({funcs: ['admin','draw','messages'], args: [userData]})
    },
    node: (userData)=>{                                                       //DRAW FOUNDS
      let founds = userData.account
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace()
      LnPrint.draw.row(0)
      LnPrint.draw.row(1)
      LnPrint.draw.column(0,'balancecolumn',3)
      LnPrint.draw.column(0,'channelscolumn',9)
      LnPrint.draw.column(1,'transactionscolumn',12)
      $('#balancecolumn').append(LnPrint.dashboard.print.balanceCard(founds))
      $('#channelscolumn').append(LnPrint.admin.print.channelsTable(founds))
      $('#transactionscolumn').append(LnPrint.admin.print.transTable(founds))
      LnPrint.admin.populate.chanTable(userData)
      //LnPrint.saveHistory({funcs: ['admin','draw','node'], args: [userData]})
    },
    products: ()=>{                                                       //DRAW PRODUCTS
      LnPrint.req.products((products)=>{
        LnPrint.clear.contentWrapper()
        LnPrint.draw.drawingspace()
        LnPrint.draw.row(0)
        LnPrint.draw.column(0,'productscolumn',12)
        $('#productscolumn').append(LnPrint.admin.print.productsTable(products))
      })
      //LnPrint.saveHistory({funcs:['admin','draw','products']})
    },
    addProduct: (edit)=>{
      edit = edit || false
      var waitUpload = true, uploadDoneCounter = 0, nPhotos
      var validateForm = LnPrint.validateForm,
          sB = 'addProductSubmitButton',
          fRF = { //form required fields
            name: false,
            pric: false,
            tags: false,
            desc: false,
            ship: true,
            mpho: true
          }
      if(edit){
        var rememberPrice = true, rememberPhoto = true
        fRF.name = true
        fRF.pric = true
        fRF.tags = true
        fRF.desc = true
      }
      var noMainPhoto = ()=>{
        fRF.mpho = false
        $('#pMainPhoto').addClass('pFieldNotMatch')
        validateForm(fRF,sB)
      }
      var validMainPhoto = ()=>{
        fRF.mpho = true
        $('#pMainPhoto').removeClass('pFieldNotMatch')
        validateForm(fRF,sB)
      }
      var pShipmentsControl = ()=>{ //Check if at least one option is checked
        let boolReturn = false
        $('.pShipmentsCB').each((i,el)=>{
          if(el.checked){
            boolReturn = true
            return false
          }
          boolReturn = false
        })
        return boolReturn
      }
      var orderCur = (cur, ticker)=>{
        var cp = []
        if(cur=='usd'){
          cp[0] = ticker.eur; cp[1] = ticker.cny
        }else if(cur=='eur'){
          cp[0] = ticker.usd; cp[1] = ticker.cny
        }else if(cur=='cny'){
          cp[0] = ticker.usd; cp[1] = ticker.eur
        }
        return cp
      }
      var currencyConverter = (cur, ticker)=>{
        var priceInputs = ['#pDraftPrice','#pWorkPrice','#pCopiesPrice']
        var fL = ['d','w','c']
        var piv = 0
        var cp = orderCur(cur, ticker)
        priceInputs.forEach((priceInput,i)=>{
          piv = $(priceInput).val()
          if(piv > 0 && piv != null && piv != undefined && piv != ""){
            $(priceInput).val(0)
            currencyConverter(cur, ticker)
          }else{
            $('#'+fL[i]+'convertedprice0').html(cp[0].symbol+' 0')
            $('#'+fL[i]+'convertedprice1').html(cp[1].symbol+' 0')
            $('#'+fL[i]+'convertedprice2').html('BTC 0')
            $('#'+fL[i]+'PriceUSD').val('0')
          }
          $(priceInput).on('input change', function() {
            piv = $(priceInput).val()

            if(cur != 'usd'){
              cp.forEach((el)=>{
                if(el.symbol == "$"){
                  $('#'+fL[i]+'PriceUSD').val(( piv * ( el.rate / ticker[cur].rate ) ).toFixed(2))
                }
              })
            }else{
              $('#'+fL[i]+'PriceUSD').val(piv)
            }

            if(piv > 0 && piv != null && piv != undefined && piv != ""){
              $('#'+fL[i]+'convertedprice0').html( cp[0].symbol +' '+ ( piv * ( cp[0].rate / ticker[cur].rate ) ).toFixed(2) )
              $('#'+fL[i]+'convertedprice1').html( cp[1].symbol +' '+ ( piv * ( cp[1].rate / ticker[cur].rate ) ).toFixed(2) )
              $('#'+fL[i]+'convertedprice2').html('BTC ' + ( piv * (1 / ticker[cur].rate) ).toFixed(8) )
            }else{
              $('#'+fL[i]+'convertedprice0').html(cp[0].symbol+' 0')
              $('#'+fL[i]+'convertedprice1').html(cp[1].symbol+' 0')
              $('#'+fL[i]+'convertedprice2').html('BTC 0')
              $('#'+fL[i]+'PriceUSD').val('0')
            }
          })
        })
      }
      var fancyUploadSedttings = {
        url:'/pphotos',
        edit: false,
        maxfilesize: 100000000,
        imgWidth: LnPrint.conf.productImgWidth,
        uploadcompleted: (e,data)=>{
          ++uploadDoneCounter
          //console.log('uploadDoneCounter: '+uploadDoneCounter+' nPhotos: '+nPhotos)
          if(uploadDoneCounter == nPhotos){
            setTimeout(function () {
              waitUpload = false
            }, 1000)
          }
        },
        added: (e,data)=>{
          noMainPhoto()
        },
        showpreview: (data,preview,previewclone,HidePreviewDialog,endelem,UpdateCroppedFile)=>{
          var tRow = $(endelem).attr('trow') //a che serviva?
          var mainPhoto = 'no'
          var cropperOptions = {
            viewMode:1,
            dragMode:'move',
            preview:'',
            modal:'false',
            checkOrientation:'false',
            movable:true,
            rotable:true,
            scalable:true,
            zoomable:true
        	}
          if($(endelem).attr('main') == 'yes'){
            cropperOptions.aspectRatio = 1
            cropperOptions.autoCropArea = 1
            mainPhoto = 'yes'
          }
          $('#imgPreview').cropper(cropperOptions)
          var cropper = $('#imgPreview').data('cropper')
          $('.ff_fileupload_dialog_main').append(LnPrint.dashboard.print.cropperCommands())
          $('#cropperRotateLeftBtn').on('click',()=>{cropper.rotate(90)})
          $('#cropperRotateRightBtn').on('click',()=>{cropper.rotate(-90)})
          $('#cropperUndoBtn').on('click',()=>{
            //cliccando annulla, se il preview si era aperto in seguito alla selezione
            //della main photo, allora ripristina il select di mainPhoto a not selected
            cropper.destroy()
            HidePreviewDialog()
            if(mainPhoto == 'yes'){
              $('.ff_fileupload_preview_image').each((i,el)=>{
                $(el).attr('main','no')
              })
              $('#pMainPhoto option').each((i,el)=>{
                $(el).removeAttr('selected').removeProp('selected')
              })
              $('#pMainPhotoNotSelected').removeAttr('disabled').attr('selected','selected').prop('selected','selected')
              noMainPhoto()
            }
          })
          $('#cropperCropBtn').on('click',()=>{
            HidePreviewDialog()
            if (cropper) {
              var canvas = cropper.getCroppedCanvas()
              dataUrl = cropper.getCroppedCanvas().toDataURL('image/jpeg')
              blob = LnPrint.dataURLtoBlob(dataUrl)
              blob.name = data.files[0].name
              blob.lastModified = (new Date()).getTime()
              blob.mainPhoto = mainPhoto
              //console.log('UpdateCroppedFile(blob) blob -> ',blob)
              UpdateCroppedFile(blob)
              if(mainPhoto == 'yes'){
                validMainPhoto()
              }
            }
          })
        }
        //fine showpreview callback
      }
      var listPresets = (pres)=>{
        $('#formPresets').children().remove()
        $('#formPresets').append('<option value="none" id="formPresets-0">none</option>')
        let preSelected = ''
        pres.forEach((pre,i)=>{
          if(edit && edit.preset == pre.name){
            preSelected = 'selected="selected"'
          }else{
            preSelected = ''
          }
          $('#formPresets').append('<option value="'+pre.name+'" id="formPresets-'+(i+1)+'" '+preSelected+'>'+pre.name+'</option>')
        })
      }
      LnPrint.clear.contentWrapper()
      LnPrint.draw.drawingspace()
      LnPrint.draw.row(0)
      LnPrint.draw.column(0,'addproductcolumn',12)
      LnPrint.admin.req.presets((presets)=>{
        $('#addproductcolumn').append(LnPrint.admin.print.addProductForm(presets,edit))
        LnPrint.req.getTicker((ticker)=>{
          currencyConverter('usd', ticker)
          if(edit && rememberPrice){
            $('#pDraftPrice').val(edit.draftPrice)
            $('#dPriceUSD').val(edit.draftPrice)
            $('#pWorkPrice').val(edit.workPrice)
            $('#wPriceUSD').val(edit.workPrice)
            $('#pCopiesPrice').val(edit.copiesPrice)
            $('#cPriceUSD').val(edit.copiesPrice)
            rememberPrice = false
          }
          $('#currencyselect').on('change',()=>{
            currencyConverter($('#currencyselect').val().toLowerCase(), ticker)
          })
        })
        //Fancy upload function
        $(function() {
        	$('#thefiles').FancyFileUpload(fancyUploadSedttings,()=>{
            //MutationObserver sulla tabella degli upload
            var fftoTargetNode = document.getElementById('ff_filestable')
            var fftoConfig = { attributes: false, childList: true, subtree: false }
            var fftoCallback = function(mutationsList, observer) { //callback chiamata quando la tabella degli upload cambia
              $('#thefiles').next().find('.ff_fileupload_actions button.ff_fileupload_start_upload').hide() //nasconde il tasto di upload
              noMainPhoto() //ivalida il form
              $('#pMainPhoto option').each((i,el)=>{ //cancella tutte le opzioni in pMainPhoto
                if(i != 0){
                  $(el).remove()
                }
              })
              $('#pMainPhotoNotSelected').removeAttr('disabled').attr('selected','selected').prop('selected','selected') //riabilita l'opzione zero
              var fnd //file name
              if($('#ff_filestable tr').length < 1){ //se la tabella degli upload è vuota
                validMainPhoto() //allora il form è valido (per quanto riguarda la foto)
              }else{ //invece se la tabella degli upload non è vuota
                $('#pMainPhotoNotSelected').attr('disabled','disabled') //disabilita l'opzione zero
                $('#ff_filestable tr').each((i,el)=>{ //e per ogni riga
                  var isSel = ''
                  fnd = $('.ff_fileupload_filename')[i] //fnd diventa il dom obj del div del nome file in quella riga
                  if(edit && rememberPhoto){ //se è un edit ed è la prima volta che la tabella viene generata
                    if(fnd.innerHTML == edit.mainPhoto){ //se il valore scritto nell'input è uguale al nome della main photo che viene dal server
                      isSel = 'selected="selected"' //la variabile isSel diventa selected
                      validMainPhoto() //valida il form
                      rememberPhoto = false //scorda la mainphoto
                    }
                  }else{ //invece se non è un edit, ma un nuovo prodotto
                    if($($('.ff_fileupload_preview_image')[i]).attr('main') == 'yes'){ //se il bottone di preview di questa riga ha l'attributo main su yes
                      isSel = 'selected="selected"' //la variabile isSel diventa selected
                      validMainPhoto() //valida il form
                    }
                  }
                  //infine per ogni riga aggiunge la sua opzione al select aggiungendo l'estensione che sta come attributo nel input
                  $('#pMainPhoto').append('<option '+isSel+' trow="'+i+'" value="file-'+i+'" id="pMainPhoto-'+i+'">'+fnd.innerHTML+'</option>') //+'.'+fnd.attributes.cfn.value
                }) //fine del foreach sulle righe della tabella degli upload
              } //fine dell'if che stabilisce se la tabella è vuota
            } //fine della callback del MutationObserver
            var ffTableObserver = new MutationObserver(fftoCallback) //dichiara il MutationObserver
            ffTableObserver.observe(fftoTargetNode, fftoConfig) //e lo assegna alla tabella degli upload
            if(edit){ //poi (siamo nella callback del FancyFileUpload), se è un edit
              if(edit.photos.length){ //se il prodotto editato aveva foto
                var fileBlob
                edit.photos.forEach((photo)=>{ //per ogni photo che aveva
                  //console.log(photo)
                  fileBlob = LnPrint.dataURLtoBlob('data:image/jpeg;base64,' + photo.fileData) //crea un blob
                  fileBlob.name = photo.fileId //e gli assegna un nome file che però è il nome random che il server ha dato durante l'inserimento, è senza estensione
                  fileBlob.lastModified = (new Date()).getTime()
                  $('#fileupladinput').fileupload('add', { files: [fileBlob] }) //fa partire i plugin aggiungendo il blob tramite jquery fileupload
                  delete photo.fileData //e cancella la stringa base64 per liberare memoria
                })
              }
            }
          }) //fine callback del FancyFileUpload
        })
        //fine funzione FancyFileUpload


        //editPresetsInputs action
        listPresets(presets)
        $('#editPresetsButton').on('click',function(){
          LnPrint.admin.draw.editPresets($('#formPresets').val(),()=>{
            //callback fired when editPreset is closed
            LnPrint.admin.req.presets((p)=>{
              presets = p
              listPresets(presets)
            })
          })
        })

        //Forum validation events
        $('#pName').on('input change',function(){
          let el = $(this).val()
          if(el != null && el != undefined && el != ""){
            $(this).removeClass('pFieldNotMatch')
            fRF.name = true
            validateForm(fRF,sB)
          }else{
            fRF.name = false
            $(this).addClass('pFieldNotMatch')
            validateForm(fRF,sB)
          }
        })
        $('#pDescription').on('input change',function(){
          let el = $(this).val()
          if(el != null && el != undefined && el != ""){
            $(this).removeClass('pFieldNotMatch')
            fRF.desc = true
            validateForm(fRF,sB)
          }else{
            fRF.desc = false
            $(this).addClass('pFieldNotMatch')
            validateForm(fRF,sB)
          }
        })
        $('#productTags').on('input change',function(){
          let el = $(this).val()
          let pattern = new RegExp('^' + $(this).attr('pattern') + '$')
          if(el != null && el != undefined && el != "" && el.match(pattern)){
            fRF.tags = true
            $(this).removeClass('pFieldNotMatch')
            validateForm(fRF,sB)
          }else{
            fRF.tags = false
            $(this).addClass('pFieldNotMatch')
            validateForm(fRF,sB)
          }
        })
        $('.pShipmentsCB').each(function(){
          $(this).on('change',function(){
            if(pShipmentsControl()){
              fRF.ship = true
              $('#pShipmentsLabel').removeClass('pFieldNotMatch')
              validateForm(fRF,sB)
            }else{
              fRF.ship = false
              $('#pShipmentsLabel').addClass('pFieldNotMatch')
              validateForm(fRF,sB)
            }
          })
        })
        $('.pNeededPrice').each(function(){
          $(this).on('input change',function(){
            if($('#pWorkPrice').val() + $('#pCopiesPrice').val() > 0){
              fRF.pric = true
              $('.pNeededPrice').removeClass('pFieldNotMatch')
              validateForm(fRF,sB)
            }else{
              fRF.pric = false
              $('.pNeededPrice').addClass('pFieldNotMatch')
              validateForm(fRF,sB)
            }
          })
        })
        $('#pMainPhoto').on('change',function(){
          $('.ff_fileupload_preview_image').each((i,el)=>{
            $(el).attr('main','no')
          })
          if($('#pMainPhoto option').length < 2){
            validMainPhoto()
          }else{
            if($('#pMainPhoto option:selected').val() == 'pMainPhotoNotSelected'){
              noMainPhoto()
            }else{
              //square crop mainn photo
              var tRow = $('#pMainPhoto option:selected').attr('trow')
              $($('.ff_fileupload_preview_image')[tRow]).attr({'main':'yes','trow':tRow}).click()

            }
          }
        })
      })
      //fine callback del req_presets

      LnPrint.admin.post.formSubmit = ()=>{
        if(validateForm(fRF,sB)){
          var insertProductData = {
            name:         $('#pName').val(),
            tags:         $('#productTags').val(),
            preset:       $('#formPresets').val(),
            description:  $('#pDescription').val(),
            mainPhoto:    $( "#pMainPhoto option:selected" ).text(),
            video:        $('#pViedo').val(),
            extLink:      $('#pExtLink').val(),
            draftPrice:   $('#dPriceUSD').val(),
            draftTime:    0,
            workPrice:    $('#wPriceUSD').val(),
            workTime:     0,
            copiesPrice:  $('#cPriceUSD').val(),
            copiesTime:   0,
            readyToSell:  $('#pDisp').val(),
            listable:     $('#pListable').is(":checked"),
            shipmentType: (()=>{
                            var abc=''
                            if($('#pShipments-0').is(":checked")){abc+='A'}
                            if($('#pShipments-1').is(":checked")){abc+='B'}
                            if($('#pShipments-2').is(":checked")){abc+='C'}
                            return abc
                          })(),
            selled:       0
          }

          function uploadEach(productId){
            //console.log('upload each start... nPhotos:',nPhotos)
            if(nPhotos > 0){
              $('#thefiles').next().find('.ff_fileupload_actions button.ff_fileupload_start_upload').each(function(i,el){
                $('.ff_fileupload_hidden input[type=hidden]').remove()
                $('.ff_fileupload_hidden').each((i,hiddenForm)=>{
                  $(hiddenForm)
                  .append('<input type="hidden" name="action" value="productPhotoUpload">')
                  .append('<input type="hidden" name="productId" value="'+productId+'">')
                })
                $(this).click()
              })
            }else{
              waitUpload = false
            }
          }

          nPhotos = $('#pMainPhoto option').length - 1
          //console.log('nPhotos',nPhotos)
          if(edit){
            insertProductData._id = edit._id
            LnPrint.admin.req.updateProduct(insertProductData,nPhotos,(productId)=>{
              uploadEach(productId)
            })
          }else{
            LnPrint.admin.req.insertProduct(insertProductData,nPhotos,(productId)=>{
              uploadEach(productId)
            })
          }
        }else{
          //se il tasto era acceso ma il form non era valido annulla l'inserimento/edit e ricarica la pagina
          location.redirect('/')
        }
        var uploadCheck = setInterval(function () {
          //console.log('waiting upload', waitUpload)
          if(!waitUpload){
            LnPrint.admin.draw.products()
            clearInterval(uploadCheck)
          }
        }, 1000)
      }
      //LnPrint.saveHistory({funcs:'noop'})
    },
    editPresets: (selectedPreset,onClose)=>{
      onClose = onClose || noop
      selectedPreset = selectedPreset || false
      LnPrint.admin.req.presets((presets)=>{
        //LnPrint.clear.contentWrapper()
        LnPrint.draw.overlay('preset',true,true,true)
        LnPrint.draw.oRow(0,'preset')
        LnPrint.draw.oRow(1,'preset')
        LnPrint.draw.oRow(2,'preset')
        LnPrint.draw.oColumn(0,'presetslistcolumn',6)
        LnPrint.draw.oColumn(0,'presetscommandscolumn',6)
        LnPrint.draw.oColumn(1,'presetsbuildercolumn',12)
        LnPrint.draw.oColumn(2,'presetscommandscolumn2',12)
        $('#presetslistcolumn').append(LnPrint.admin.print.presetsList(presets))
        $('#presetscommandscolumn').append(LnPrint.admin.print.presetsCommands())
        $('#presetsbuildercolumn').append(LnPrint.admin.print.presetBuilder())
        $('#presetscommandscolumn2').append(LnPrint.admin.print.presetsCommands2())

        var formData = false,
            savedFormData = false,
            presetBuilderDone = false,
            isSavedPreset = true,
            isNewPreset = false,
            actualPreset = '',
            presetEditControl

        $('.hideRenderWrap').hide()
        $('#presetscommandscolumn2').hide()

        $('#closeEditPresetBtn').on('click',()=>{
          function closeOverlay(){
            clearInterval(presetEditControl)
            $('#preset_overlay').remove()
            onClose()
          }
          if(presetBuilderDone){
            clearPresetBuilder(false,
              ()=>{
                closeOverlay()
              },
              ()=>{return}
            )
          }else{
            closeOverlay()
          }

        })
        $('#editformbtn').on('click',(e)=>{
          e.preventDefault()
          hideRender()
        })
        $('.savepresetbtn').each(function(){
          $(this).on('click',()=>{
            $('.buildWrap .save-template').click()
          })
        })
        $('#newPresetBtn')
        .on('click',()=>{
          LnPrint.modal.new({
            from:'editProduct',
            name:'onDemand',
            content:'<input type="text" id="presetnameinput" class="ep-form-control">'+
                    '<button class="btn btn-primary btn-block" id="savePresetNameBtn">save</button>'+
                    '<button class="btn btn-secondary btn-block" id="undoNewPresetBtn">undo</button>',
            after: ()=>{
              $('#undoNewPresetBtn').on('click',()=>{
                LnPrint.modal.close(1)
              })
              $('#savePresetNameBtn').on('click',()=>{
                function addPreset(){
                  //console.log('new preset added')
                  if(isNewPreset && actualPreset != ''){
                    deleteOption($('#'+$('#presetselect').data('lastOpt')))
                  }
                  isNewPreset = true
                  actualPreset = $('#presetnameinput').val().replace(/\s+/g, " ")
                  LnPrint.modal.close(1,()=>{
                    let _id = actualPreset.replace(/\s+/g, "-")
                    $('#presetselect').append('<option value="'+actualPreset+'" id="preset_'+_id+'" selected="">'+actualPreset+'</option>')
                    $('#delPresetBtn').prop('disabled',false)
                    showEdit()
                  })
                }
                if(checkPresetName($('#presetnameinput').val())){
                  if(presetBuilderDone){
                    clearPresetBuilder(false,
                      ()=>{
                        addPreset()
                      },
                      ()=>{
                        LnPrint.modal.close(1)
                      }
                    )
                  }else{
                    addPreset()
                    doFB(false)
                  }
                }else{
                  LnPrint.notifyMsg({type:'alert',text:'Preset already exist!'})
                }
              })
            }
          })
        })
        .on('focusin', function(){
          $('#presetselect').data('lastOpt', $('#presetselect option:selected').attr('id'))
          //console.log('focusin',$('#presetselect option:selected').attr('id'))
        })
        $('#delPresetBtn').on('click',()=>{
          var $selectedOption = $('#presetselect option:selected'),
              cT = 'delete'
          if(isNewPreset && isSavedPreset){
            cT = false
          }
          clearPresetBuilder(cT,()=>{
            if($selectedOption.data('name') && $selectedOption.data('name') == actualPreset){
              LnPrint.admin.req.delPreset(actualPreset,()=>{
                deleteOption($selectedOption)
              })
            }else{
              deleteOption($selectedOption)
            }
          })
        })
        $('#presetselect')
        .on('change',()=>{
          //console.log('change')
          doFB($('#presetselect option:selected').data('formData'),()=>{
            //console.log('changed')
            if(isNewPreset && actualPreset != '' && $('#presetselect').data('lastOpt') != 'formPresetNotSelected'){
              deleteOption($('#'+$('#presetselect').data('lastOpt')),$('#presetselect option:selected'))
              showEdit()
            }
            savedFormData = $('#presetselect option:selected').data('formData')
          })
          actualPreset = $('#presetselect option:selected').text()
          $('#delPresetBtn').prop('disabled',false)
        })
        .on('focusin', function(){
          $('#presetselect').data('lastOpt', $('#presetselect option:selected').attr('id'))
          //console.log('focusin',$('#presetselect option:selected').attr('id'))
        })

        $('#presetselect option').each(function(i){
          if(i>0){
            $(this).data('formData',presets[(i - 1)].formData).data('name',presets[(i - 1)].name)
          }
        })

        var fBOptions = {
              controlOrder: ['select','checkbox-group','radio-group','text','textarea','date'],
              showActionButtons: true, // is hidden by formbuilder callback
              notify: {
                error: function(message) {return console.error(message)},
                success: function(message) {return},
                warning: function(message) {return console.warn(message)}
              },
              //disabledActionButtons: ['data'],
              disabledAttrs: ['name','access'],
              disabledSubtypes: {text: ['password'], textarea: ['tinymce','quill']},
              //disableFields: ['autocomplete'],
              disableInjectedStyle: true,
              fieldRemoveWarn: true, // defaults to false
              fields:[
                {
                  label: "Email",
                  type: "text",
                  subtype: "email",
                  icon: "✉"
                }
              ],
              onAddField: function(fieldId,hh) {
                //console.log('field added')
                isSavedPreset = false
                toggleSaveBtn(false)
                $('#previewPresetBtn').prop('disabled',false)
              },
              onSave: function(evt, formData) {
                //console.log('saved')
                LnPrint.admin.req.savePreset(actualPreset,formData,(res)=>{
                  $('#presetselect option:selected').data('formData',formData).data('name',$('#presetselect option:selected').val())
                  hideRender()
                  isNewPreset = false
                  isSavedPreset = true
                  toggleSaveBtn(true)
                  savedFormData = formData
                })
              },
              // i18n: {
              //   locale: 'it-IT'
              // }
              //prepend: '<h4>product specific form</h4>', // DOM Object, Array of Dom Objects/Strings or String
              //append: '<h5>end of product specific form</h5>',
            }
        function toggleSaveBtn(b){
          $('.savepresetbtn').each(function(){
            $(this).prop('disabled',b)
          })
        }
        function hideEdit(){
          $('.buildWrap,#presetscommandscolumn2').hide()
        }
        function showEdit(){
          $('.buildWrap,#presetscommandscolumn2').show()
        }
        function showRender(){
          $('.buildWrap, #presetscommandscolumn2').hide()
          $('.hideRenderWrap').show()
        }
        function hideRender(){
          $('.hideRenderWrap').hide()
          $('.buildWrap, #presetscommandscolumn2').show()
        }
        function checkPresetName(presetName){
          var presetNames = []
          $('#presetselect option').each(function(){
            presetNames.push($(this).val())
          })
          if(presetNames.includes(presetName)){
            return false
          }else{
            if(presetName != 'none' && presetName != ''){
              return true
            }else{
              return false
            }
          }
        }
        function deleteOption($sO,$nextO){
          $nextO = $nextO || false
          //console.log('option '+$sO.text()+' removed')
          $sO.remove()
          if($nextO){
            $("#presetselect").val($nextO.val())
            actualPreset = $nextO.val()
          }else{
            $('#presetselect').get(0).selectedIndex = 0
            hideEdit()
            actualPreset = ''
            toggleSaveBtn(true)
          }
          $('#delPresetBtn').prop('disabled',true)
          isNewPreset = false
          isSavedPreset = true
        }
        function clearPresetBuilder(clearType,cbYes,cbNo){
          clearType = clearType || false
          cbNo = cbNo || noop
          cbYes = cbYes || noop
          var $selectedOption = $('#presetselect option:selected')
          if(isSavedPreset && clearType != 'delete'){
            //console.log('all fields cleared')
            LnPrint.fB.actions.clearFields()
            setTimeout(function () {
              //console.log('cbYes!')
              cbYes()
            }, 600)
          }else{
            if(clearType == 'reset'){
              var text = 'are you sure? All modified field will be restored'
            }else if(clearType == 'delete'){
              var text = 'are you sure to delete '+actualPreset+' preset?'
            }else{
              var text = 'are you sure? Your actual work will be deleted'
            }
            LnPrint.modal.new({
              from:'editProduct',
              name:'prompt',
              text:text,
              cbYes: ()=>{
                //console.log('all fields cleared')
                LnPrint.fB.actions.clearFields()
                setTimeout(function () {
                  cbYes()
                }, 600) //without this there are no way to setData only after clearFileds
              },
              cbNo: ()=>{cbNo()}
            })
          }
        }
        function doFB(formData,cb){
          cb = cb || noop
          if(formData){
            fBOptions.formData = formData
          }
          if(presetBuilderDone){
            clearPresetBuilder(false,()=>{
              //console.log('doFB -> formData: ', formData)
              if(formData){
                LnPrint.fB.actions.setData(formData)
              }
              showEdit()
              cb()
            })
          }else{
            jQuery(function($) {
                $('.buildWrap').formBuilder(fBOptions).promise.then((formBuilder)=>{
                  //console.log('doFB -> formData: ', formData)
                  savedFormData = formData
                  LnPrint.fB = formBuilder
                  $('.form-actions').hide()
                  $('#resetPresetBtn').on('click',()=>{
                    $sO = $('#presetselect option:selected')
                    if($sO.data('name') && $sO.data('name') == $sO.text()){
                      var oldFormData = $('#presetselect option:selected').data('formData')
                    }else{
                      var oldFormData = false
                    }
                    clearPresetBuilder('reset',()=>{
                      if(oldFormData){
                        //console.log('resetPresetBtn oldFormData',oldFormData)
                        LnPrint.fB.actions.setData(oldFormData)
                        isSavedPreset = true
                        toggleSaveBtn(true)
                      }
                    })
                  })
                  $('#previewPresetBtn').on('click',()=>{
                    showRender()
                    //console.log('preview')
                    $('.renderWrap').formRender({formData: LnPrint.fB.formData})
                  }).prop('disabled',true)
                  presetBuilderDone = true
                  showEdit()
                  presetEditControl = setInterval(function () {
                    if($('#presetselect').val() != 'formPresetNotSelected'){
                      $('#delPresetBtn').prop('disabled',false)
                    }
                    if(LnPrint.fB.formData && LnPrint.fB.formData.length > 2){
                      $('#previewPresetBtn').prop('disabled',false)
                      if(savedFormData == LnPrint.fB.formData){
                        toggleSaveBtn(true)
                        isSavedPreset = true
                      }else{
                        toggleSaveBtn(false)
                        isSavedPreset = false
                      }
                    }else{
                      toggleSaveBtn(true)
                      $('#previewPresetBtn').prop('disabled',true)
                      if(savedFormData == LnPrint.fB.formData){
                        isSavedPreset = true
                      }
                    }
                  }, 100)
                  LnPrint.intervals.push(presetEditControl)
                  // setInterval(function () {
                  //   //console.log('(savedFormData == formData):',(savedFormData == LnPrint.fB.formData),'savedFormData',savedFormData,'actualPreset',actualPreset,'isNewPreset',isNewPreset,'isSavedPreset',isSavedPreset,'fB',LnPrint.fB.formData)
                  // }, 100)
                  cb()
                })
            })
          }
        }
      })
    },
    works: (userData)=>{                                                        //DRAW WORKS
      works = userData.works
      LnPrint.clear.contentWrapper()
      //LnPrint.saveHistory({funcs: ['admin','draw','works'], args: [userData]})
    },
    shipments: (userData)=>{                                                    //DRAW SHIPMENTS
      shipments = userData.shipments
      LnPrint.clear.contentWrapper()
      //LnPrint.saveHistory({funcs: ['admin','draw','shipment'], args: [userData]})
    }
  },
  populate:{
    chanTable: (userData)=>{
      //console.log(userData)
    }
  }
}
