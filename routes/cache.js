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
    filename: `./db/smartweave.sqlite`,
  },
  useNullAsDefault: true,
});

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

let sdk = null;

router.get("/state/:contractTxId", async function (req, res, next) {
  const { contractTxId } = req.params;
  const isSafe = await isSafeContract(contractTxId);
  if (!isSafe) {
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
        "https://gateway.redstone.finance",
        { notCorrupted: true }
      )
    )
    .setDefinitionLoader(
      new RedstoneGatewayContractDefinitionLoader(
        "https://gateway.redstone.finance",
        arweave,
        new MemCache()
      )
    )
    .build();
  console.log("SDK initialized");
};

(async () => {
  LoggerFactory.INST.logLevel("error");
  async function worker() {
    const contracts = await safeContracts();
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
      worker()
        .then(() => {
          console.log(`Task completed.`);
        })
        .catch((r) => {
          console.log(`Task error.`, r);
        });
      workerLoop();
    }, 1000 * 60 * 5);
  })();
})();
