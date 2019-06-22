process.env['GRPC_SSL_CIPHER_SUITES'] = 'HIGH+ECDSA';
var fs = require('fs');
var path = require('path');
var os = require('os');
var grpc = require('grpc');
var protoDescriptor = grpc.load('./btcd/api.proto');
var walletrpc = protoDescriptor.walletrpc;

var certPath = './btcd/rpc3.cert'

var cert = fs.readFileSync(certPath);
var creds = grpc.credentials.createSsl(cert);
var client = new walletrpc.WalletService('127.0.0.1:18332', creds);
console.log('creds',creds)

var request = {
    account_number: 0,
    required_confirmations: 1
};
client.balance(request, function(err, response) {
    if (err) {
        console.error(err);
    } else {
        console.log('Spendable balance:', response.spendable, 'Satoshis');
    }
});
