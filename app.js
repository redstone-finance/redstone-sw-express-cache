const express = require('express');
const cors = require('cors');
const cacheRouter = require('./routes/cache');

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: false }));

app.use('/cache', cacheRouter.router)


app.listen(5777, async () => {
  console.log("Initializing SDK");
  await cacheRouter.init();
  console.info(`Express api listening at http://localhost:5777`);
});


