const express = require('express');
const cors = require('cors');
const cacheRouter = require('./routes/cache');
const testnetCacheRouter = require('./routes/cache-testnet');

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
    });

const app = express();

app.use(cors());
app.use(express.json({limit: "50mb", extended: true}));
app.use(express.urlencoded({extended: false}));

app.use('/cache', cacheRouter.router)
app.use('/testnet/cache', testnetCacheRouter.router)


app.listen(5777, async () => {
    console.log("Initializing SDK");
    await testnetCacheRouter.init();
    await cacheRouter.init();
    console.info(`Express api listening at http://localhost:5777`);
});


