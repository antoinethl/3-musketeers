const axios = require('axios');
const money = require('money');

const RATES_URL = 'https://api.exchangeratesapi.io/latest';
const BLOCKCHAIN_URL = 'https://blockchain.info/ticker';
const CURRENCY_BITCOIN = 'BTC';

// function that returns a boolean, returns true if "from" or "to" equal "BTC", false if not

const isAnyBTC = (from, to) => [from, to].includes(CURRENCY_BITCOIN);

module.exports = async opts => {

  // initialize "amount", "from" and "to" with values contained in opts if they are undefined, we initialize them with default values
  const {amount = 1, from = 'USD', to = CURRENCY_BITCOIN} = opts;

  // promises array
  const promises = [];
  let base = from;

  // boolean
  const anyBTC = isAnyBTC(from, to);

  // if "from" or "to" is "BTC" then "base" equals "to" if "from" equals 'BTC'. Else, base equals "from" 
  if (anyBTC) {
    base = from === CURRENCY_BITCOIN ? to : from;
    promises.push(axios(BLOCKCHAIN_URL));
  }

  // now we ask axios to retrieve informations about the currency 
  promises.unshift(axios(`${RATES_URL}?base=${base}`));

  try {

    // waiting for all the promises
    const responses = await Promise.all(promises);
    const [rates] = responses;

    money.base = rates.data.base;
    money.rates = rates.data.rates;

    const conversionOpts = {
      from,
      to
    };

    if (anyBTC) {

      // blockchain equals the reponse with the right currency as base
      const blockchain = responses.find(response =>
        response.data.hasOwnProperty(base)
      );

      Object.assign(money.rates, {
        'BTC': blockchain.data[base].last
      });
    }

    if (anyBTC) {
      Object.assign(conversionOpts, {
        'from': to,
        'to': from
      });
    }

    return money.convert(amount, conversionOpts);
  } catch (error) {
      throw new Error('Please specify a valid `from` and/or `to` currency value!');
  }
};
