const express = require("express")
const {
  createPost,
  getPosts,
  getPostById,
} = require("../controllers/postController")
const { protect } = require("../middleware/authMiddleware")
const router = express.Router()
const postRouter = require("./commentRoutes")
const likesRouter = require("./likeRoutes")

router.use("/:postId/comments", postRouter)
router.use("/:postId", likesRouter)

router.route("/create-post").post(protect, createPost)
router.route("/").get(protect, getPosts)
router.route("/:id").get(protect, getPostById)

module.exports = router
