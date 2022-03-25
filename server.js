require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/user");
const { route } = require("express/lib/application");

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

// User registration
app.post("/api/register", async (req, res) => {
  const { username, password: plainTextPassword } = req.body;

  //username validation
  if (!username || typeof username !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }

  // password validation 
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 6) {
    return res.json({
      status: "error",
      error: "password should be more than 6 character",
    });
  }
  // password hashing
  const password = await bcrypt.hash(plainTextPassword, 10);

  // creating new user with username and password
  try {
    const response = await User.create({
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


// login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).lean();

  //checking user should not be blank
  if (!user) {
    return res.json({ status: "error", error: "Invalid username or password" });
  }

  //conparing hash token before login
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 1800
      }
    );
    return res.json({ status: "ok", data: token });
  }
  res.json({ status: "error", error: "Invalid username or password" });
});



// Change password route
app.post("/api/changepassword", async (req, res) => {
  const { token, newpassword: plainTextPassword } = req.body;

  //password validation. It will check password should not be blank and should be string.
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  // password length should not be less than 6
  if (plainTextPassword.length < 6) {
    return res.json({
      status: "error",
      error: "password should be more than 6 character",
    });
  }

  //verifying user token and changing password of that perticular user
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(user)
    const _id = user.id;
    const password = await bcrypt.hash(plainTextPassword, 10);
    const newUser = await User.updateOne(
      { _id },
      {
        $set: { password },
      }
    )
    res.json({status: 'ok'});
  } catch (error) {
    res.json({ status: "error", error: "something went wrong" });
  }
});


app.get('/', (req, res)=> {
  res.send('Hey, this is home page');
})

// listening on port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
