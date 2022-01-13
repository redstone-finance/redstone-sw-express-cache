
const Undici = require('undici');
const fetch = Undici.fetch;

module.exports.safeContracts = async function() {
  const response = await fetch(`https://gateway.redstone.finance/gateway/contracts-safe`)
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

module.exports.isSafeContract = async function(id) {
  const safe = await module.exports.safeContracts();
  return safe.find(c => c.contract_id === id) !== undefined;
}
