const express = require('express');
const Arweave = require('arweave');
const {SmartWeaveNodeFactory, RedstoneGatewayInteractionsLoader} = require('redstone-smartweave');
const knex = require('knex');

const router = express.Router();

const knexConfig = knex({
  client: 'sqlite3',
  connection: {
    filename: `./db/smartweave.sqlite`
  },
  useNullAsDefault: true
});

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

let sdk = null;

router.get('/state/:contractTxId', async function (req, res, next) {
  const {contractTxId} = req.params;
  const result = await sdk.contract(contractTxId).readState();

  res.send(result);
});

module.exports.router = router;

module.exports.init = async function () {
  sdk = (await SmartWeaveNodeFactory.knexCachedBased(arweave, knexConfig, 10))
    .setInteractionsLoader(
      new RedstoneGatewayInteractionsLoader("https://gateway.redstone.finance", {notCorrupted: true}))
    .build();
  console.log("SDK initialized");
};
