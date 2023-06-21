const express = require("express")
const {
  registerUser,
  loginUser,
  updateUser,
  getUsers,
  forgotPassword,
  resetPassword,
  getSearchUsers,
} = require("../controllers/userController")
const { protect } = require("../middleware/authMiddleware")
const router = express.Router()

router.route("/").get(getUsers)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/update").put(protect, updateUser)
router.route("/search/:userKeyword").get(getSearchUsers)
router.route("/forgotpassword").post(forgotPassword)
router.patch("/resetPassword/:token", resetPassword)

module.exports = router
