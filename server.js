const express = require("express")
const dotenv = require("dotenv")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
const connectDB = require("./config/db.js")
const cors = require("cors")
const bodyParser = require("body-parser")
const helmet = require("helmet")
const rateLimiter = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const userRoutes = require("./routes/userRoutes")
const postRoutes = require("./routes/postRoutes")
const commentRoutes = require("./routes/commentRoutes")
const likeRoutes = require("./routes/likeRoutes")
const uploadRoutes = require("./routes/uploadRoutes")

dotenv.config()

connectDB()

const app = express()
app.use(cors())
app.use(helmet({ crossOriginResourcePolicy: false }))

const limiter = rateLimiter({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: "Too Many requests from this IP, try again in one hour",
})

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Limit requests from same API
app.use("/api", limiter)

// Prevent parameter pollution
//app.use(
//  hpp({
//    whitelist: [
//      'duration',
//      'ratingsQuantity',
//      'ratingsAverage',
//      'maxGroupSize',
//      'difficulty',
//      'price'
//    ]
//  })
//);

// Serving static files
//app.use(express.static({ extended: false }))

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/posts/:id/comments", commentRoutes)
app.use("/api/posts/:id", likeRoutes)
app.use("/api/upload", uploadRoutes)

//app.use("/uploads", express.static(path.join(__dirname, "/uploads")))
app.use("/uploads", express.static(`${__dirname}/uploads`))

app.get("/", (req, res) => {
  res.send("API is running....")
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
