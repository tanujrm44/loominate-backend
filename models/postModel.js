const mongoose = require("mongoose")

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    body: {
      type: String,
      required: [true, "Please provide a body"],
    },
    tags: {
      type: String,
      required: [true, "Please provide a tag"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    numComments: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Post = mongoose.model("Post", postSchema)

module.exports = Post
