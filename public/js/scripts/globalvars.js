//GENERAL
var LnPrint = {
  pushHistorySwitch: true,
  snapshots: [],
  forward: [],
  intervals: [],
  bitcoinReady: false,
  qrcodeReady: false,
  node: {
    uri:'',
    alias:''
  },
  noop: function(){}
}
var noop = function(){}
var mobile
//LINKS
var timeouts = 20
var ajaxTimeout = 5000
//STICKYBAR
var navLinkShift
var transy,transx
var stickyBarHyster = true
//MODALS
var modal = {}
//DASHBOARD
var dashboard = {}
//PRODUCTS
//var products = {}
//ADMIN
var admin = {}
