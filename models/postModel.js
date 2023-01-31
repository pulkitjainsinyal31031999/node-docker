const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, require: [true, "Post must have title"] },
  body: {
    type: String,
    required: [true, "post must have body"],
  },
});

module.exports = mongoose.model("Post", postSchema);
