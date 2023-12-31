const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  friends: { type: Array },
  chats: { type: Array },
  likedPost: { type: Array },
  pendingRequest: { type: Array },
  image: { type: String },
  userSince: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
