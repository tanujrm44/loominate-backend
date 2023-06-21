const User = require("../models/userModel")
const asyncHandler = require("express-async-handler")
const generateToken = require("../utils/generateToken")
const sendEmail = require("../utils/email")
const crypto = require("crypto")
const Post = require("../models/postModel")

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error("User Already Exists")
  }

  const user = await User.create({ name, email, password, confirmPassword })
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error("Invalid User Credentials")
  }
})

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  user.numPosts = await Post.countDocuments({ user: user._id })

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      numPosts: user.numPosts,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid User Credentials")
  }
})

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.image = req.body.image || user.image
    if (req.body.password) {
      user.password = req.body.password
    }
    if (req.body.confirmPassword) {
      user.confirmPassword = req.body.confirmPassword
    }

    const updatedUser = await user.save({ validateBeforeSave: false })

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error("User Not Found")
  }
})

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})

  res.status(200).json(users)
})

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error("User Not Found")
  }

  const resetToken = user.createPasswordResetToken()

  await user.save({ validateBeforeSave: false })

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetpassword/${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    })

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    res.status(500).json({
      status: "error",
      message: "There was an error sending the email. Try again later!",
    })
  }
})

exports.getSearchUsers = asyncHandler(async (req, res) => {
  const { userKeyword } = req.params

  const keyword = userKeyword
    ? {
        name: {
          $regex: new RegExp(userKeyword, "i"),
        },
      }
    : {}

  const users = await User.find({ ...keyword }).select("name image")

  res.status(200).json(users)
})

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    res
      .status(400)
      .json({ status: "fail", message: "Token is invalid or has expired" })
  }
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res)
  res.status(200).json({
    _id: user._id,
    token: generateToken(user._id),
  })
})
