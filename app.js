const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const postsRoute = require("./routes/posts");
const userRoute = require("./routes/user");
const auth = require("./middleware/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/images", express.static("images"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/user", userRoute);
// app.use(auth);
app.use("/api/posts/", postsRoute);
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(5000, () => {
      console.log("Connection successful");
    });
  })
  .catch((err) => {
    console.log("connection failed");
  });
