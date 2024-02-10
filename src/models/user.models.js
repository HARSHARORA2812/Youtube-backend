import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({

  username : {
      type : String,
      required : true,
      unique : true,
      lowecase : true,
      trim : true,
      index : true
  },
  email : {
    type : String,
    required : true,
    unique : true,
    lowecase : true,
    trim : true,
},
  fullName : {
    type : String,
    required : true,
    trim : true,
    index : true, 
  },
  avatar : {
    type : String,  //cloudnery url
    required : true
  },
  coverImage : {
    type : String,  //cloudnery url
  },
  watchHistory : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Video"
  }],
  password : {
    type : String,
    required : [true , 'Password is required'],
  },
  refreshToken : {
    type : String,
  }

},{timestamps : true})

userSchema.pre("save" ,async function (next) {
  if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
   next()
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function ( ){
   return jwt.sign(
    {
      _id : this.id,
      username : this.username,
      email : this.email,
      fullName : this.fullName
   },
     process.env.ACCESS_TOKEN_SECREAT,
     {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
     }
    
   
   )
}
userSchema.methods.generateRefreshToken = function (){
  return jwt.sign(
    {
      _id : this.id,
   },
     process.env.REFRESH_TOKEN_SECREAT,
     {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
     }
    
   
   )
}

export const User = mongoose.model("User",userSchema)