/* eslint-env node */
const express = require("express");
const app = express();

app.use("/", express.static("./www/"));

app.listen(8000, () => console.log("richtext fiddler started on port 8000")); 