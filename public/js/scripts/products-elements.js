LnPrint.products.print = {
  productsTable: (products)=>{
    let tableIntestation = `
      <div id="ptablewrapper" style="width:100%;height:100%;">
        <div class="overthetable">
          <div class="tabletitlediv">
          Products
          </div>
          <div class="uptableborder">

          </div>
        </div>
        <table id="producttable" class="mytable">
          <thead>
            <tr>
              <td>photo</td>
              <td>name</td>
              <td>work price</td>
              <td>price</td>
              <td>available</td>
            </tr>
          </thead>
    `
    if(products.length > 0){
      let tableBody = `<tbody>`
      products.forEach((p,i)=>{
        if(!(p.prices.w == 0 && p.readyToSell == 0)){
          tableBody += `
            <tr class="productrow" pid="`+p.id+`">
              <td>`+(()=>{
            if(p.mainPhoto == 'no'){return `
                <img src="img/nophoto.jpg" `
            }else{return `
                <img src="data:image/jpeg;base64,`+ p.mainPhoto +`"`
            }})() +`
                style="height:40px;width:40px;"></img>
              </td>
              <td class="p-name">`+p.name+`</td>
              <td>`+p.prices.w+`</td>
              <td>`+p.prices.c+`</td>
              <td>`+p.readyToSell+`</td>
            </tr>
          `
        }
      })
      tableBody += `</tbody></table>`
      return tableIntestation + tableBody
    }else{
      return tableIntestation + `</table></div>`
    }
  },
  productDetail:(divData)=>{
    //console.log(divData)
    let _p = divData.product,
        _d = _p.description.slice(0,200),
        _h = 'auto',
        _w = divData.width,
        _l = divData.left,
        _t = divData.top,
        _i = divData.i,
        _c = divData.color,
        priceLabel = 'copies price'
    if((_p.copiesPrice > 0) && (!(_p.workPrice > 0)) && (!(_p.draftPrice > 0))){
      priceLabel = 'price'
    }
    return `
      <div id="proddetaildiv_`+_i+`" class="container-fluid proddetaildiv" pid="`+_p.id+`"
      style="left:`+_l+`px;top:`+_t+`px;width:`+_w+`px;height:`+_h+`px;padding:0;margin:0;background-color:`+_c+`;">
        <div class="row justify-content-sm-start justify-content-md-between no-gutters" style="padding:4px;padding-top:0;">
          <div class="col-12 col-lg-10 text-sm-left text-center order-lg-2 padding6 colbord pdname">`+_p.name+`</div>
          <div class="col-0 pdspacer order-lg-1"></div>
          <div class="col-sm-auto order-lg-4 padding6 colbord pdphotoname">
            <div class="pdphoto">`+(()=>{
      if(_p.mainPhoto == 'no'){return `
              <a>
                <img src="img/nophoto.jpg" `
      }else{return `
              <a class="photoclick" href="javascript:void(0)">
                <img src="data:image/jpeg;base64,`+ _p.mainPhoto +`" `
      }})() +`
                style="height:70px;width:70px;"></img>
              </a>
            </div>
            <div class="thetagdiv pdtags">tags</div>
          </div>
          <div class="col-sm-10 col-md-9 col-lg-5 text-sm-left text-center order-lg-5 padding6 colbord pddesc">
            <span style="font-weight:bold">description</span>
            <p style="margin:0;padding:0">`+_d+(()=>{
      if(_l < _p.description.length){return `
              <a style="font-weight:bold;" href="javascript:void(0)">...</a>`
      }else{return ''}})() +`
            </p>
          </div>
          <div class="col-sm-auto col-lg-2 order-lg-3 colbord pdlinks">
            <div class="row no-gutters align-items-md-center align-items-lg-end" style="height: 100%;">
              <div class="col-12 text-sm-right text-center colbord">
                <div class="row no-gutters">
                  <div class="col-6 col-sm-12 col-lg-6 text-lg-center text-sm-left text-md-center text-center padding6 colbord">
                    <a style="font-weight:bold;" href="`+_p.video+`" target="_blank" rel="noopener">video</a>
                  </div>
                  <div class="col-6 col-sm-12 col-lg-6 text-lg-center text-sm-left text-md-center text-center padding6 colbord">
                    <a style="font-weight:bold;" href="`+_p.extLink+`" target="_blank" rel="noopener">ext. link</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col order-lg-6 padding6 colbord pdprices" style="margin-bottom: 8px;">
            <div class="container-fluid" style="min-width: 230px;padding:0;">
              <div class="row no-gutters justify-content-center justify-content-md-end">
              `+(()=>{
      var divs = ''
      if(_p.readyToSell > 0){
        divs += `
                <div class="col-3 col-sm-2 col-md-auto col-lg-4 pdprice colbord pddisp">
                  <span style="font-weight:bold">available</span><br>`+_p.readyToSell+`
                </div>
        `
      }
      if(_p.copiesPrice > 0){
        divs += `
                <div class="col-3 col-sm-2 col-md-auto col-lg-4 pdprice colbord pdcprice">
                  <span style="font-weight:bold">`+priceLabel+`</span><br>`+_p.copiesPrice+`
                </div>
        `
      }
      if(_p.workPrice > 0){
        divs += `
                <div class="col-3 col-sm-2 col-md-auto col-lg-4 pdprice colbord pdwprice">
                  <span style="font-weight:bold">work price</span><br>`+_p.workPrice+`
                </div>
        `
      }
      if(_p.workTime > 0){
        divs += `
                <div class="col-3 col-sm-2 col-md-auto col-lg-4 pdprice colbord pdwtime">
                  <span style="font-weight:bold">work time</span><br>`+_p.workTime+`
                </div>
        `
      }
      if(_p.draftPrice > 0){
        divs += `
                <div class="col-3 col-sm-2 col-md-auto col-lg-4 pdprice colbord pddprice">
                  <span style="font-weight:bold">draft price</span><br>`+_p.draftPrice+`
                </div>
        `
      }
      if(_p.draftTime > 0){
        divs += `
                <div class="col-3 col-sm-2 col-md-auto col-lg-4 pdprice colbord pddtime">
                  <span style="font-weight:bold">draft time</span><br>`+_p.draftTime+`
                </div>
        `
      }
      return divs})()+`
              </div>
            </div>
          </div>
          <div class="col-12 d-md-none d-lg-block col-lg-12 order-lg-7 colbord">
            <div class="row no-gutters justify-content-center">
              <div class="col-11">
                <div class="divisor"></div>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-bottom: 8px;" class="col-12 col-md-2 col-lg-12 order-lg-8 colbord pdorderbutton">
            <button class="btn btn-sm btn-primary orderProductButton">order...</button>
          </div>
        </div>
      </div>
    `
  },
  carousel: (photos)=>{
    if(photos.length > 0){
      let cHead = `
        <div id="photoPreviewCarousel" class="carousel slide" data-interval="0" data-ride="false">
          <ol class="carousel-indicators">
      `
      let cBody = `<div class="carousel-inner">`

      photos.forEach((p,i)=>{
        cHead += `
          <li data-target="#photoPreviewCarousel" data-slide-to="`+i+`"`+(()=>{
            if(i==0){return 'class="active"'}
          })()+`></li>
        `
        cBody += `
          <div class="carousel-item `+(()=>{
            if(i==0){return 'active'}
          })()+`">
            <div class="carousel-img-div" style="background-image:url('data:image/jpeg;base64,`+p.fileData+`');">

            </div>
          </div>
        `
      })
      cHead += `</ol>`
      cBody += `
        </div>
          <a class="carousel-control-prev" href="#photoPreviewCarousel" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#photoPreviewCarousel" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
          </a>
        </div>
      `
      return cHead + cBody
    }else{
      //Notify no photos and close preview
    }
  }
}
