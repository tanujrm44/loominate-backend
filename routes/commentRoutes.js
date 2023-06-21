const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const { createcomment } = require("../controllers/commentController")
const router = express.Router({ mergeParams: true })

router.route("/").post(protect, createcomment)
router.route("/:id").get(protect, createcomment)

module.exports = router
