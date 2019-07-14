const basePage = `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>

      <meta charset="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes">
      <meta name="theme-color" content="#a6ffdc"/>
      <meta name="Description" content="lightningnetwork lightning network wallet print pdf">

      <link rel="manifest" href=".webmanifest">
      <link rel="icon" href="img/favicon.png" type="image/png" />

      <title>LightningPrintings</title>

    </head>

    <body id="thebody" class="container-fluid height100">
      <div id="backLoading" style="mix-blend-mode: darken;background-color: #000000;
      position: fixed;top: 0;left: 0;height: 100%;width: 100%;z-index: 9999998;">
        <div id="loading"
        style="mix-blend-mode:hard-light;background:url('../img/lightning800.gif') no-repeat center center;
        background-color:#1d1d1d;background-size:cover;position:absolute;top:0;left:0;height:100%;width:100%;z-index: 9999999;">
        </div>
      </div>

      <button id="addAppBtn" class="btn footerbtn" href="javascript:void(0);">install app</button>
      <button id="donateBtn" class="btn footerbtn" href="javascript:void(0);" onclick="LnPrint.modal.new({from:'donate',name:'deposit'})">Donate</button>

      <script src="js/scripts/globalvars.js"></script>
      <script src="js/scripts/pagesParts.js"></script>
      <script src="js/plugin/jquery.min.js"></script>
      <script src="js/plugin/jquery.color.js"></script>
      <script src="js/plugin/popper.min.js"></script>
      <script src="js/plugin/mybootstrap.bundle.js"></script>
      <script src="js/plugin/autosize.min.js"></script>
      <script src="js/plugin/socket.io.js"></script>
      <script src="js/plugin/polyFills.js"></script>

      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
      <link rel="stylesheet" href="/css/bootstrap.css" type="text/css" />
      <link rel="stylesheet" href="/css/styles.css" type="text/css" />
      
      <link rel="stylesheet" href="/css/datatables.css" type="text/css" />
      <link rel="stylesheet" href="/css/ffuploader.css" type="text/css" />
      <link rel="stylesheet" href="/css/cropper.css" type="text/css" />
      <link rel="stylesheet" href="/css/cart.css" type="text/css" />

      <div class="sticky-footer" id="footer">
        <div style="padding-top: 0.3rem;padding-bottom: 0.1rem;display: block;">
          <div style="padding: 0;">
            <p id="copyright" class="text-center text-muted" style="margin-bottom: 0.4rem;font-size: 0.75em;">
              © 2018 Fr4nZ82@gmail.com
            </p>
          </div>
        </div>
      </div>

    </body>

    <script src="js/scripts/effects.js"></script>
    <script src="js/scripts/utils.js"></script>
    <script src="js/scripts/req.js"></script>
    <script src="js/scripts/modal.js"></script>
    <script src="js/scripts/modal-elements.js"></script>
    <script src="js/scripts/onload.js"></script>

  </html>
`
module.exports = basePage