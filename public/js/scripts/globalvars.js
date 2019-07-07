//GENERAL
var LnPrint = {
  backward: [],
  forward: [],
  intervals: []
}
var noop = function(){}
var Udata = {
  page: {
    name: 'home',
    type: 'page',
    first: 'no'
  },
  node: {
    uri:'',
    alias:''
  },
  bitcoinReady: false,
  qrcodeReady: false
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
