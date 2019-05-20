var express = require("express");
const app = express();
app.use(require("./user.js"));
app.use(require("./company.js"));
module.exports = app;
