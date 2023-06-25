const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true },
  comments: { type: Array },
  likes: { type: Array },
  creator: { type: String, required: true },
  category: { type: Array, required: true },
  time: { type: String, required: true },
});

module.exports = mongoose.model("Post", postSchema);
