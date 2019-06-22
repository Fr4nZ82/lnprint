var fs = require('fs'),
    path = require('path')

module.exports = {
  lnpLogo:(clc)=>{
    let colors = clc.green.bgYellowBright
    let style = { ".": clc.green.bgYellowBright("█") }
    let logo ="\n      ...................................\n" +
                "      ...................................\n" +
                "      ...."+colors("                           ")+"....\n" +
                "      ...."+colors("         Lightning         ")+"....\n" +
                "      ...."+colors("         Printings         ")+"....\n" +
                "      ...."+colors("                           ")+"....\n" +
                "      ...................................\n" +
                "      ...................................\n\n"
    return clc.art(logo, style)
  },
  dev:                    true,
  minify:                 false,
  sourceMapping:          true,
  httpsUrl:               "https://lightningprintings.com",
  invoiceExpireTime:      18000000,
  maxInvoiceAmt:          4294967,
  rootPubKey:             '027963d2c990f1b37209512f56b00a96ed42713a6785fd8cb8a0041a71fce80b14',
  ports:                  { http: 80, https: 443 },
  dbPath:                 "localhost:27017",
  productsFilesPath:      'uploads/pphotos',
  productImgWidth:        800,
  thumbSize:              80,
  txMinConfirmations:     4,
  zombiesPurificationTime:300000,
  txCheckingTime:         60000,
  channelSyncTime:        120000,
  tickerUpdateTime:       60000,
  feesUpdateTime:         300000,
  geonamesUpdateTime:     604800000,
  sslOptions: {
    key:    fs.readFileSync(path.resolve(__dirname,'sslcert/private.key')),
    cert:   fs.readFileSync(path.resolve(__dirname,'sslcert/certificate.crt')),
    ca:     fs.readFileSync(path.resolve(__dirname,'sslcert/ca_bundle.crt'))
  },
  staticOptions: {
    //dotfiles:   'allow', //activate this when need to renew ssl cert
    etag:       true,
    extensions: ['html','htm'],
    index:      false,
    maxAge:     '1d',
    redirect:   false/*,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }*/
  },
  sessionOptions: {
    //dbname: ' name ', //only if not the same of mongoose
    secret:            '196jkd93jgvmsxloewwlg9438kfvk340903ewwjg0pw8ep94',
    cookieName:        'LightningPrintings',
    resave:            true,
    saveUninitialized: true,
    maxAge:            (1000 * 60 * 60 * 24 * 1) //1 day in millisecond
  },
  sassOptions: {
    src:      __dirname + '/views/scss',
    dest:     __dirname + '/public/css',
    debug:    false,
    prefix:   '/css',  // Where prefix is at <link rel:"stylesheets" href:"prefix/style.css"/>
  },
  LND: {
    host:          '192.168.1.153:10009',
    cert:          fs.readFileSync(path.resolve(__dirname,'.cf/cert')).toString(),
    macaroon:      fs.readFileSync(path.resolve(__dirname,'.cf/macaroon')).toString(),
    password:      fs.readFileSync(path.resolve(__dirname,'.cf/pw')).toString(),
    maxPaymentFee: 100
  }
}

            //ADMIN KEY:  L24aD7Hmkg4ZYi7GxxWZGGtdGxWToSqWdo1aazNsjYbnLYTV1MHA
            //ROOT KEY:   KyqNH2XQzbJCVdnk9sszVGubhJrArVvV8KFyH6dL5vSYANwZAazk
// 607c15fc8b18f3d9e24a4a14cb870ef2w7+RXa51Nur6GUyPh7/oCusn/ZAccjI9NT8DtBlk55tmoPOpXmoGQOn/xSBq5xTKLOW68bdsCK9VqCqcpwvdVg==
// dispositivo hardware per gli artigiani ed i negozi online.
// Questo comprenderebbe un full node di btc con LND (su raspberry o simili) con le seguenti interfacce: una interfaccia da amministratore per gestire i prodotti e il nodo LND, una interfaccia web per i clienti, una api che permette ad altri server web di accedere ai prodotti in modo da poter creare dei "accentratori" che elencano tutti i prodotti di tutti, una interfaccia per gestire i pagamenti del cliente che si reca fisicamente in negozio.
// L'interfaccia web per il cliente comprende anche un "web ln wallet", pensato per rendere facili promozioni, coupon regalo ecc, che permette al cliente di depositare e prelevare btc sia con normali tx sia con ln.
// lightningprintings.com puoi entrare con questa chiave per vedere l'admin interface: L4YsUhbposFPnkVNS9oVZikN1MGh1WG8aTmSvRVjQKqyFkkVKXy4

/*dispositivo hardware per gli artigiani ed i negozi online. Questo comprenderebbe un full node di btc con LND (su raspberry o simili) con le seguenti interfacce: una interfaccia da amministratore per gestire i prodotti e il nodo LND, una interfaccia web per i clienti, una api che permette ad altri server web di accedere ai prodotti in modo da poter creare dei "accentratori" che elencano tutti i prodotti di tutti, una interfaccia per gestire i pagamenti del cliente che si reca fisicamente in negozio.
L'interfaccia web per il cliente comprende anche un "web ln wallet", pensato per rendere facili promozioni, coupon regalo ecc, che permette al cliente di depositare e prelevare btc sia con normali tx sia con ln.
https://lightningprintings.com puoi entrare con questa chiave per vedere l'admin interface: L4YsUhbposFPnkVNS9oVZikN1MGh1WG8aTmSvRVjQKqyFkkVKXy4*/
