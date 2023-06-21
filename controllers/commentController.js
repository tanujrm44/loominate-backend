const asyncHandler = require("express-async-handler")
const Comment = require("../models/commentModel")
const Post = require("../models/postModel")

exports.createcomment = asyncHandler(async (req, res) => {
  const { comment } = req.body

  const post = await Post.findById(req.params.postId)

  if (post) {
    const commentObj = new Comment({
      user: req.user._id,
      comment,
    })

    const savedComment = await commentObj.save()

    post.comments.push(savedComment._id)
    post.numComments = post.comments.length

    await post.save()
    res.status(201).json({ message: "Comment added" })
  } else {
    res.status(404)
    throw new Error("Post not found")
  }
})

//const createComment = await Comment.create({
//  user: req.user._id,
//  post: req.params.postId,
//  comment,
//})

//if (createComment) {
//  res.status(201).json({
//    _id: createComment._id,
//    user: createComment.user,
//    //post: createComment.post,
//    comment: createComment.comment,
//  })
//} else {
//  res.status(400)
//  throw new Error("Could not create comment")
//}
//})
