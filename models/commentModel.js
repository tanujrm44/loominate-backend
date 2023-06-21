const mongoose = require("mongoose")

const commentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
      required: [true, "Please provide a comment"],
    },
  },
  {
    timestamps: true,
  }
)

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment
