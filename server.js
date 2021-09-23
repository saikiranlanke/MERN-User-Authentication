const express = require("express");
const mongoose = require("mongoose");
const Registeruser = require("./model");
const middleware = require("./middleware");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

mongoose.connect("mongodb://localhost:27017/user_authentication", {
  useNewUrlParser: true,
});

mongoose.connection
  .once("open", () => {
    console.log("DB Connected");
  })
  .on("error", (error) => {
    console.log("Your Error", error);
  });

app.use(express.json());

app.use(cors({ origin: "*" }));

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;
    let exist = await Registeruser.findOne({ email });
    if (exist) {
      return res.status(400).send("Email Already Exist");
    }
    if (password !== confirmpassword) {
      return res.status(400).send("Password is not matching");
    }
    let newUser = new Registeruser({
      username,
      email,
      password,
      confirmpassword,
    });
    await newUser.save();
    res.status(200).send("Registered Successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let exist = await Registeruser.findOne({ email });
    if (!exist) {
      return res.status(400).send("Email Not Found");
    }
    if (exist.password !== password) {
      return res.status(400).send("Invalid Credentials");
    }
    let payload = {
      user: {
        id: exist.id,
      },
    };
    jwt.sign(payload, "jwtsecret", { expiresIn: 3600000 }, (err, token) => {
      (err, token) => {};
      if (err) throw err;
      return res.json({ token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.get("/myprofile", middleware, async (req, res) => {
  try {
    let exist = await Registeruser.findById(req.user.id);
    if (!exist) {
      return res.status(400).send("User not found");
    }
    res.json(exist);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Invalid Token");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Server  is Running...");
});
