const {broadcastResponse} = require('./../async-util');

const rowTypes = require('./conf/row_types');

const intBase = 10;

/** Send tokens in a blockchain transaction.

  {
    address: <Destination Address String>
    lnd: <Object>
    tokens: <Satoshis Number>
    fees:
    wss: <Web Socket Server Object>
  }

  @returns via cbk
  {
    confirmation_count: <Number>
    id: <Transaction Id String>
    is_confirmed: <Is Confirmed Bool>
    is_outgoing: <Is Outgoing Bool>
    tokens: <Tokens Number>
    type: <Type String>
  }
*/
module.exports = ({address, lnd, tokens, fees}, cbk) => {
  if (!address) {
    return cbk([400, 'ExpectedAddress']);
  }

  if (!lnd) {
    return cbk([500, 'ExpectedLnd']);
  }

  if (!tokens) {
    return cbk([400, 'MissingTokens']);
  }

  return lnd.sendCoins({addr: address, amount: tokens, sat_per_byte: fees}, (err, res) => {
    if (!!err) {
      return cbk([503, 'SendCoinsErr', err]);
    }

    if (!res || !res.txid) {
      return cbk([503, 'ExpectedTransactionId', res]);
    }

    return cbk(null, res.txid);
  });
};
