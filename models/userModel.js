const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const validator = require("validator")
const crypto = require("crypto")
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    image: {
      type: String,
      default: "/uploads/sample.jpg",
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      //required: true,
      validate: {
        validator: function (v) {
          return v === this.password
        },
        message: "Password does not match",
      },
    },
    numPosts: {
      type: Number,
      default: 0,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

//userSchema.pre("save", async function (next) {
//  this.numPosts = await Post.countDocuments({ user: req.user._id })
//  next()
//})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex")

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model("User", userSchema)

module.exports = User
