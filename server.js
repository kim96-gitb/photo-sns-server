const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const fileUpload = require("express-fileupload");
const user = require("./routes/user");
const follow = require("./routes/follow");
const posting = require("./routes/posting");

const app = express();

app.use(express.json());
app.use(fileUpload());

app.use("/api/v1/user", user);
app.use("/api/v1/follow", follow);
app.use("/api/v1/posting", posting);

const PORT = process.env.PORT;

app.listen(PORT, console.log("개발 시작"));
