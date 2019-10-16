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
  sourceMapping:          false,
  onlyHttps:              true, //disable when need to renew ssl certificate from sslforfree.com
  httpsUrl:               "https://lightningprintings.com",
  invoiceExpireTime:      18000000,
  maxInvoiceAmt:          4294967,
  rootPubKey:             fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/rootpubkey')),
  ports:                  { http: 80, https: 443 },
  dbPath:                 "localhost:27017",
  productsFilesPath:      'uploads/pphotos',
  productImgWidth:        800,
  thumbSize:              80,
  txMinConfirmations:     4,
  zombiesPurificationTime:300000,
  txCheckingTime:         10000,
  channelSyncTime:        15000,//120000,
  tickerUpdateTime:       60000,
  feesUpdateTime:         300000,
  geonamesUpdateTime:     604800000,
  sslOptions: {
    key:    fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/sslcert/private.key')),
    cert:   fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/sslcert/certificate.crt')),
    ca:     fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/sslcert/ca_bundle.crt'))
  },
  staticOptions: {
    dotfiles:   'allow',
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
    secret:            fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/sessionSecret')).toString(),
    cookieName:        'LightningPrintings',
    resave:            true,
    saveUninitialized: true,
    maxAge:            (1000 * 60 * 60 * 24 * 1) //1 day in millisecond
  },
  LND: {
    host:          '192.168.1.153:10009',
    cert:          fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/.cf/cert')).toString(),
    macaroon:      fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/.cf/macaroon')).toString(),
    password:      fs.readFileSync(path.resolve(__dirname,'../../lnPrintCfgFiles/.cf/pw')).toString(),
    maxPaymentFee: 100
  }
}
