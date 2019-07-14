//GENERAL
var LnPrint = {
  backward: [],
  forward: [],
  intervals: [],
  bitcoinReady: false,
  qrcodeReady: false,
  node: {
    uri:'',
    alias:''
  }
}
var noop = function(){}
var Udata = {
  page: {
    name: 'home',
    type: 'page',
    first: 'no'
  }
}
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
