require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const user = require("./model/user");

mongoose.connect('mongodb://localhost:27017/login-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const port = process.env.PORT || 8000
const app = express();
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, 'static')));

app.post('/api/register', async (req, res) => {
    console.log(req.body);
    res.json({ status: 'ok'});
})

app.listen(port, () => {
    console.log(`server is running at port ${port}`);
})