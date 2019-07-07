LnPrint.pagesParts = {
  intestation: (loggedUser)=>{ return `
    <div id="logobig" class="container-fluid">
      <div class="row align-items-center justify-content-center">
        <div id="logoimgdiv" class="col-sm-6">
            <img  src="/img/lnprint_big.png" class="img-fluid" alt="Responsive image" maxwidth="410px">

        </div>
        <div class="col-sm-6"><br>
          <!-- <div id="debug-container"></div>
          <button class="refresh-button" onclick="getDebugInfo()">Refresh </button> -->

          <h6 id="intestationText" class="text-white text-center">
            Lightning Printings is a<br>web LN shopping wallet.<br>you can deposit and withdraw<br>
            with regular onchain tx;<br>also you can send and receive with<br>
            <a class="linkondark font-weight-bold" href="https://lightning.network/" target="_blank" rel="noopener">
            lightning network</a>.
            <br>You can pay other lightning shop<br>or buy our products.
            <br><br>
            First time here?<br>Follow the
            <a class="linkondark font-weight-bold" href="javascript:void(0);" onclick="LnPrint.scrollToId('#SBSG',-78);">
            step by step guide</a><br> to easly use this app!
            <br><br>
            Registered user?<br>Go directly to your
            <a id="dashboardIntestation" class="linkondark font-weight-bold toDashboardLinks" href="javascript:void(0);"
            onclick="`+(()=>{
              if(loggedUser){
                return `LnPrint.req.changepage('dashboard')`
              }else{
                return `LnPrint.modal.new({from:'dashboard',name:'keyQuery'})`
              }})()+`">dashboard</a>
            <br><br>
          </h6>
        </div>
      </div>
    </div>
  `},
  navbar: (page,loggedUser,isAdmin)=>{return `
    <nav id="naviga" class="navbar sticky-top navbar-dark navbar-expand-sm"`+(()=>{
      if(page != 'home'){
        return ` style="border-bottom-left-radius: 0;border-bottom-right-radius: 0"`
      }else{return ''}})()+`>

      <div id="navbarcontentdiv" class="container-fluid">

        <!-- SMALL LOGO -->

        <a id="logosmalla" class="navbar-brand navbar-nav" href="javascript:void(0);"`+(()=>{
          if(page == 'home'){
            return ` onclick="$('html,body').stop().animate({scrollTop:0}, 500);" style="padding: 0px;"`
          }else{
            return ` onclick="LnPrint.req.changepage('home')" style="padding: 0px;"`
          }})()+`>

          <img id="logosmall" src="/img/lnprint.png" alt="">
        </a>
        <!-- /SMALL LOGO -->

        <!-- NAVBAR LINKS -->
        <div class="collapse navbar-collapse" id="navbarlinks">`+(()=>{
          if(!isAdmin || page != 'admin'){return `
          <ul id="navButtons" class="navbar-nav mr-auto">

            <li class="nav-item`+(()=>{if(page=='home'){return ' active'}else{return ''}})()+`">
              <a class="nav-link" href="javascript:void(0);"
              onclick="`+(()=>{
            if(page=='home'){
              return `$('html,body').stop().animate({scrollTop:0}, 500);`
            }else{
              return `LnPrint.req.changepage('home');`
            }})()+`">Home</a>
            </li>

            <li class="nav-item`+(()=>{if(page=='products'){return ' active'}else{return ''}})()+`">
              <a class="nav-link" href="javascript:void(0);"
              onclick="`+(()=>{
            if(page=='products'){
              return `$('html,body').stop().animate({scrollTop:0}, 500);`
            }else{
              return `LnPrint.req.changepage('products');`
            }})()+`">Products</a>
            </li>

            <li class="nav-item`+(()=>{if(page=='dashboard'){return ' active'}else{return ''}})()+`">
              <a id="dashboardNav" class="nav-link toDashboardLinks" href="javascript:void(0);"
              onclick="`+(()=>{
            if(loggedUser){
              if(page=='dashboard'){
                return `$('html,body').stop().animate({scrollTop:0}, 500);`
              }else{
                return `LnPrint.req.changepage('dashboard');`
              }
            }else{
              return `LnPrint.modal.new({from:'dashboard',name:'keyQuery'});`
            }})()+`">Dashboard</a>
            </li>

          </ul>
          `}else{return ''}})()+`
        </div>
        <!-- /NAVBAR LINKS -->

        <!-- NAVBAR ICONS -->
        <div id="navicons" class="row">

          <!-- HAMBURGER -->
          <button id="hamburger"
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarlinks"
            aria-controls="#navbarlinks"
            aria-expanded="false"
            aria-label="Toggle navigation">
              <i class="fa fa-bars navbar-icon"></i>
          </button>
          <!-- /HAMBURGER -->

      `+(()=>{
        if(loggedUser){return `
            <!-- USER AND BELL -->
            <div id="userandbell" class="row">
          `+(()=>{
            if(page != 'admin'){return `
              <i id="bellicon" class="fas fa-fw fa-bell navbar-icon">
                <span id="bellcounts" class="label">23</span>
              </i>
          `}else{return ''}})()+`
              <a id="usericon" class="fas fa-fw fa-user-circle navbar-icon"
              href="javascript:void(0);" onclick="LnPrint.modal.new({from:'usericon',name:'userInfo'})">
              </a>
            </div>
            <!-- /USER AND BELL -->
      `}else{return ''}})()+`
        </div>
        <!-- /NAVBAR ICONS -->

      </div>
      <!-- /NAVBAR CONTENT DIV -->

    </nav>
  `},
  home: (loggedUser)=>{return `
    <div id='hwdiv' class="container">
      <br><h4>
      <a id="SBSG" class="badge badgeT" href="javascript:void(0);"
      onclick="LnPrint.scrollToId('#SBSG',-5);">Step by step guide</a></h4>
      <p class="badgeh" onclick="LnPrint.modal.new({from:'guide',name:'nodeInfo'})">
      Optional: open a channel with our node</p>
      <p class="badgep" id="step1">
        Obviosly, for payments, you can use your already existing channels; open a
        new channel with our node, owever, increase your and us LN routing
        capability. If You deposit satoshis and let them in your account
        you can use the channel for routing purpose. You can retrive your unspent
        satoshis whenever you want without any additional costs. Incrase the
        routing capability of the network is good for you, for us, and for all
        LN users!
      </p>
      <p class="badgeh" id="step2"
      onclick="LnPrint.modal.new({from:'guide',name:'`+(()=>{if(!loggedUser){return 'keyQuery'}else{return 'userInfo'}})()+`'})">
      Save your key!</p>
      <p class="badgep">
        No need e-mail, no need password, no need your data.
        We generate a random private and public key using bitcoin standards.
        We do not save your private key in the database but we save the correspondings public key.
        Copy the private key and save it in a safe place.
        Only with this key you can login in the application.
      </p>
      <p class="badgeh" onclick="">
      Products and works</p>
      <p class="badgep">
        <span class="willbe">
        This app is special, you can use it for shopping in any lightning shop out
        of there and you can use it to order products and works that will be added
        on our databases...<br>
        Each product has different specifications and prices.<br>
        Select the various options, write special requests in the appropriate
        field. The email is not mandatory, but you can enter one to
        receive notifications and drafts.<br>Some products need a small
        pre-payment to prepare a draft; This is because there is a little work
        to do, to show you the result. Also without this
        payment anyone could spam, make us do this work and then disappear.</span>
      </p>
      <p class="badgeh">
      Waiting the draft</p>
      <p class="badgep">
        <span class="willbe">
        When you order a work we send that work to the production and in few hours
        the draft will be ready. If you have specified the email we will send
        you a notification, otherwise you can see your draft in your dashboard.<br>
        If you accept the draft specifies how many copies you want and pay the work,
        otherwise you can tell us what to modify and / or request another draft
        (the second draft is always free);</span>
      </p>
      <p class="badgeh">
      Wait the production</p>
      <p class="badgep">
        <span class="willbe">
        You can see the status of your print in your dashboard. If you have
        specified the email, a notification will be sent to you at
        the end of the job.</span>
      </p>
      <p class="badgeh">
      Shipping</p>
      <p class="badgep">
        <span class="willbe">
        Decide on the shipping method, fill in the forum with your address
        and pay the shipping cost (this can also be done during production).
        As soon the work and the payment is done, we send you the package.</span>
      </p>
      <p class="badgeh">
      Order more!!</p>
      <p class="badgep">
        <span class="willbe">
        At any time you can order other copies of a work already done,
        there are no limits to the number of copies. For example, if you
        order 1000 flyers and you realize you need another 100:
        no problem, reopen the work and order another 100 copies by paying
        the invoice.</span>
      </p>

      <br>

    </div>
  `},
  dashboard:()=>{return `
    <div id="wrapper" class="wrapper">

      <script src="js/plugin/datatables.min.js"></script>
      <script type="text/javascript" src="js/scripts/dashboard.js"></script>
      <script type="text/javascript" src="js/scripts/dashboard-elements.js"></script>
      <script type="text/javascript" src="js/plugin/zxing.min.js"></script>

      <!-- Sidebar -->
      <ul id="thesidebar" class="thesidebar sidebar navbar-nav">
        <li class="nav-item active">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.dashboard.draw.overview(Udata.user);">
            <i class="fas fa-fw fa-table"></i>
            <span>Overview</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.dashboard.draw.messages(Udata.user);">
            <i class="fas fa-fw fa-envelope"></i>
            <span>Messages</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.dashboard.draw.founds(Udata.user);">
            <i class="fab fa-fw fa-btc"></i>
            <span>Founds</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.dashboard.draw.works(Udata.user);">
            <i class="fas fa-fw fa-print"></i>
            <span>Works</span></a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.dashboard.draw.shipments(Udata.user);">
            <i class="fas fa-fw fa-shopping-cart"></i>
            <span>Cart</span></a>
        </li>
      </ul>
    
      <div id="content-wrapper">
    
    
      </div>
      <!-- /.content-wrapper -->
    
    </div>
    <!-- /#wrapper -->
  `},
  products:()=>{return `
    <div id="wrapper" class="wrapper">

      <script src="js/plugin/datatables.min.js"></script>
      <script type="text/javascript" src="js/plugin/formBuilder.js"></script>
      <script src="js/scripts/products.js"></script>
      <script src="js/scripts/products-elements.js"></script>
      
      <link rel="stylesheet" href="/css/formrender.css" type="text/css" />

      <div id="content-wrapper">
    
      </div>
      <!-- /.content-wrapper -->
    
    </div>
    <!-- /#wrapper -->
  `},
  admin:()=>{return `
    <div id="wrapper" class="wrapper">   

      <link rel="stylesheet" href="css/addproductform.css" type="text/css" />
      <link rel="stylesheet" href="css/editpreset.css" type="text/css" />

      <script>var thisPageName = 'admin';</script>
      <script type="text/javascript" src="js/plugin/zxing.min.js">                </script>
      <script type="text/javascript" src="js/plugin/jquery-ui.min.js">            </script>
      <script type="text/javascript" src="js/plugin/formBuilder.js">              </script>
      <script type="text/javascript" src="js/plugin/jquery.fileupload.js">        </script>
      <script type="text/javascript" src="js/plugin/jquery.iframe-transport.js">  </script>
      <script type="text/javascript" src="js/plugin/jquery.fancy-fileupload.js">  </script>
      <script type="text/javascript" src="js/plugin/cropper.js">                  </script>
      <script type="text/javascript" src="js/plugin/jquery-cropper.js">           </script>
      <script type="text/javascript" src="js/scripts/admin.js">                   </script>
      <script type="text/javascript" src="js/scripts/admin-elements.js">          </script>
      <script type="text/javascript" src="js/scripts/admin-req.js">               </script>

      <!--[if lte IE 8]><script type="text/javascript" src="js/plugin/excanvas.js"></script><![endif]-->

      <!-- Sidebar -->
      <ul id="thesidebar" class="thesidebar sidebar navbar-nav">
        <li class="nav-item active">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.overview(Udata.user);">
            <i class="fas fa-fw fa-table"></i>
            <span>Overview</span>
          </a>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.users(Udata.user);">
            <i class="fas fa-fw fa-users"></i>
            <span>Users</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.messages(Udata.user);">
            <i class="fas fa-fw fa-envelope"></i>
            <span>Messages</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.node(Udata.user);">
            <i class="fas fa-fw fa-bolt"></i>
            <span>LND node</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.products(Udata.user);">
            <i class="fas fa fa-archive"></i>
            <span>Products</span></a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.works(Udata.user);">
            <i class="fas fa-fw fa-print"></i>
            <span>Works</span></a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="javascript:void(0);" onclick="LnPrint.admin.draw.shipments(Udata.user);">
            <i class="fas fa-fw fa-shopping-cart"></i>
            <span>Cart</span></a>
        </li>
      </ul>

      <div id="content-wrapper">


      </div>
      <!-- /.content-wrapper -->

    </div>
    <!-- /#wrapper -->
  `}
}
