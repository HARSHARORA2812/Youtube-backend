import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
  origin : process.env.CORS_ORIGIN,
  credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(urlencoded({extended : true , limit : "16kb"}))

app.use(express.static("public"))
app.use(cookieParser())


// import Routers

import userRouter from  "./routs/user.routs.js"
import tweetRouter from  "./routs/tweet.routs.js"
import playlistRouter from  "./routs/playlist.routs.js"
import videoRouter from  "./routs/video.routs.js"
import commentRouter from  "./routs/comment.routs.js"
import likeRouter from  "./routs/like.routs.js"
import subscriptionRouter from  "./routs/subscription.routs.js"
import dashboardRouter from  "./routs/dashboard.routs.js"

app.use("/api/v1/user",userRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/like",likeRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/dashboard",dashboardRouter)


export { app }