const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const { likePost, dislikePost } = require("../controllers/postController")
const router = express.Router({ mergeParams: true })

router.route("/like").post(protect, likePost)
router.route("/dislike").post(protect, dislikePost)

module.exports = router
