const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5100;

app.listen(PORT, console.log("개발 시작"));
