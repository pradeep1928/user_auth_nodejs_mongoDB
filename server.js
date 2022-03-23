require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const user = require("./model/user");

// configuration
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDB connected successfully"))
  .catch((err) => console.log(err));

const app = express();
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "static")));

app.post("/api/register", async (req, res) => {
  console.log(req.body);

  // password hashing
  const { username, password: plainTextPassword } = req.body;
  if (!username || typeof username !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 6) {
    return res.json({
      status: "error",
      error: "password should be more than 6 character",
    });
  }

  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const response = await user.create({
      username,
      password,
    });
    console.log("user created successfylly", response);
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ status: "error", error: "Username already in use" });
    }

    throw error;
  }

  res.json({ status: "ok" });
});



// listening on port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
