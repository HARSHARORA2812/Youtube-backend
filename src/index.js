// require('dotenv').config({path : './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js ";

dotenv.config({
  path: './path'
})

import express from 'express';


const app = express();

connectDB()
.then(() => {
  
  app.listen(process.env.PORT || 8000 , () => {
    console.log(`app listening on ${process.env.PORT}`);
  })
})
.catch((err) => {
  console.log("MongoDB connection Failed : ",err);
})



/*
;( async () => {
  try {
   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
   app.on("error", (error) => {
     console.log(error);
   })

    app.listen(process.env.PORT,() => {console.log(`app listening on ${process.env.PORT}`);})

  } catch (error) {
    console.log(error);
  }
})()

*/