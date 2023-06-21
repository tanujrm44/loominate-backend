const asyncHandler = require("express-async-handler")
const Post = require("../models/postModel")

exports.createPost = asyncHandler(async (req, res) => {
  const { title, body, tags, category } = req.body

  const post = await Post.create({
    title,
    body,
    tags,
    category,
    user: req.user._id,
  })

  if (post) {
    // Fetch the populated user information using the post's user ID
    const populatedPost = await Post.findById(post._id).populate({
      path: "user",
      select: "name email image",
    })

    res.status(201).json({
      _id: populatedPost._id,
      user: populatedPost.user,
      title: populatedPost.title,
      body: populatedPost.body,
      tags: populatedPost.tags,
      category: populatedPost.category,
      likes: populatedPost.likes,
      dislikes: populatedPost.dislikes,
      numComments: populatedPost.numComments,
    })
  } else {
    res.status(400)
    throw new Error("Could not create post")
  }
})

exports.getPosts = asyncHandler(async (req, res) => {
  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1
  const keyword = req.query.keyword
    ? { title: { $regex: req.query.keyword, $options: "i" } }
    : {}
  const count = await Post.countDocuments({ ...keyword })
  const posts = await Post.find({ ...keyword })
    .populate({
      path: "user",
      select: "name email image",
    })
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name email image",
      },
    })
    .limit(pageSize)
    .skip(pageSize * (page - 1))

  res.status(200).json({ posts, page, pages: Math.ceil(count / pageSize) })
})

exports.getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: "user",
    select: "name email image",
  })
  if (post) {
    res.status(200).json(post)
  } else {
    res.status(404)
    throw new Error("Post not found")
  }
})

exports.likePost = asyncHandler(async (req, res) => {
  const { liked } = req.body
  const post = await Post.findById(req.params.postId)
  if (post) {
    liked && (post.likes += 1)
    !liked && (post.likes -= 1)
    const updatedPost = await post.save()
    res.status(200).json(updatedPost)
  } else {
    res.status(404)
    throw new Error("Post not found")
  }
})

exports.dislikePost = asyncHandler(async (req, res) => {
  const { disliked } = req.body
  const post = await Post.findById(req.params.postId)
  if (post) {
    disliked && (post.dislikes += 1)
    !disliked && (post.dislikes -= 1)
    const updatedPost = await post.save()
    res.status(200).json(updatedPost)
  } else {
    res.status(404)
    throw new Error("Post not found")
  }
})
