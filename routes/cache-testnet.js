const express = require("express");
const Arweave = require("arweave");
const {
  SmartWeaveNodeFactory,
  RedstoneGatewayInteractionsLoader,
  RedstoneGatewayContractDefinitionLoader,
  MemCache, LoggerFactory,
} = require("redstone-smartweave");
const knex = require("knex");
const { isSafeContract, safeContracts } = require("../tools/safeContracts");

const router = express.Router();

const knexConfig = knex({
  client: "sqlite3",
  connection: {
    filename: `./db/smartweave-testnet.sqlite`,
  },
  useNullAsDefault: true,
});

const arweave = Arweave.init({
  host: "testnet.redstone.tools",
  port: 443,
  protocol: "https",
});

let sdk = null;

router.get("/state/:contractTxId", async function (req, res, next) {
  const { contractTxId } = req.params;
  const isSafe = await isSafeContract(contractTxId, true);
  if (!isSafe) {
    res.status(404);
    res.send("Contract not registered as safe!");
  } else {
    const result = await sdk.contract(contractTxId).readState();
    res.send(result);
  }
});

module.exports.router = router;

module.exports.init = async function () {
  sdk = (await SmartWeaveNodeFactory.knexCachedBased(arweave, knexConfig, 1))
    .setInteractionsLoader(
      new RedstoneGatewayInteractionsLoader(
        "https://d2v8ja5p4ag05d.cloudfront.net",
        { notCorrupted: true }
      )
    )
    .setDefinitionLoader(
      new RedstoneGatewayContractDefinitionLoader(
        "https://d2v8ja5p4ag05d.cloudfront.net",
        arweave,
        new MemCache()
      )
    )
    .build();
  console.log("SDK initialized");
};

(async () => {
  LoggerFactory.INST.logLevel("fatal");
  async function worker() {
    const contracts = await safeContracts(true);
    console.log(`Loading state for ${contracts.length} contracts`);
    for (let contract of contracts) {
      console.log(
        `Loading ${contract.contract_id}: ${contracts.indexOf(contract) + 1} / ${contracts.length}`
      );
      try {
        await sdk.contract(contract.contract_id).readState();
      } catch (e) {
        console.error(e);
      }
    }
  }

  await worker();

  (function workerLoop() {
    setTimeout(async function () {
      console.log("Starting worker");

      try {
        await worker();
      } catch (e) {
        console.error(e);
      }

      workerLoop();
    }, 1000 * 60 * 10);
  })();
})();