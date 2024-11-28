const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");

const indexRouter = require('./src/routers/index');
const pastPosRouter = require('./src/routers/PastPosRouter');
const cntPosRouter = require('./src/routers/CntPosRouter');

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config({ path: "./.env.local" });

app.use("/api", indexRouter);
app.use("/api/v1/pastPos", pastPosRouter);
app.use("/api/v1/cntPos", cntPosRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
