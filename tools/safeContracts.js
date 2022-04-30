
const Undici = require('undici');
const fetch = Undici.fetch;

module.exports.safeContracts = async function(testnet = false) {
  const url = testnet
    ? 'https://d2v8ja5p4ag05d.cloudfront.net/gateway/contracts-safe'
    : `https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts-safe`;

  const response = await fetch(url)
    .then(res => {
      return res.ok ? res.json() : Promise.reject(res);
    })
    .catch((error) => {
      if (error.body?.message) {
        this.logger.error(error.body.message);
      }
      throw new Error(`Unable to retrieve safe contracts. ${error.status}.`);
    });

  return response;
}

module.exports.isSafeContract = async function(id, testnet = false) {
  const safe = await module.exports.safeContracts(testnet);
  return safe.find(c => c.contract_id === id) !== undefined;
}
