const nock = require('nock');
const idx = require('./index.js');

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

describe('currency', () => {
  test('should convert 1 USD to EUR', async () => {
    const opts = {
      'amount': 1,
      'from': 'USD',
      'to': 'EUR'
    };
    const test = await idx(opts)
    expect(test).toBe(0.899);
  });

  test('should convert 1 USD to USD', async () => {
    const opts = {
      'amount': 1,
      'from': 'USD',
      'to': 'USD'
    };
    const test = await idx(opts)
    expect(test).toBe(1)
  });

  test('should convert 1 EUR to USD', async () => {
    const opts = {
      'amount': 1,
      'from': 'EUR',
      'to': 'USD'
    };
    const test = await idx(opts)
    expect(test).toBe(1.1122)
  });

  test('should convert 1 BTC to USD', async () => {
    const opts = {
      'amount': 1,
      'from': 'BTC',
      'to': 'USD'
    };
    const test = await idx(opts)
    expect(test).toBe(8944.49)
  });

  test('should convert 1 BTC to EUR', async () => {
    const opts = {
      'amount': 1,
      'from': 'BTC',
      'to': 'EUR'
    };
    const test = await idx(opts)
    expect(test).toBe(8048.11)
  });

  test('should convert (with default values) without arguments', async () => {
    const opts = {};
    const test = await idx(opts)
    expect(test).toBe(1 / 8944.49)
  });

  test('should convert with amount only as argument', async () => {
    const opts = { 'amount': 2 };
    const test = await idx(opts)
    expect(test).toBe((1 / 8944.49) * 2)
  });

  test('should convert with amount and (from) currency only as arguments', async () => {
    const opts = { "amount": 2, "from": "EUR"};
    const test = await idx(opts)
    expect(test).toBe((1 / 8048.11) * 2)
  });

  test('should return errors message for unknown `from` or `to` currency value', async () => {
    const opts = {
      'amount': 1,
      'from': 'ZZ',
      'to': 'ZZ'
    };
    //expect(await idx(opts)).toThrow(Error());
    test = await idx(opts)
    console.log(typeof test)
    /*const t = () => {
      throw new Error('Please specify a valid `from` and/or `to` currency value!');
    };*/
    expect(t).toThrow(Error('Please specify a valid `from` and/or `to` currency value!'));
  });
});
