import { ApiError } from "../utils/apiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudibary} from "../utils/cloudnery.js"
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req,res)=> {
   
  const {fullName , username , email, password} = req.body;

  if (
    [fullName , username , email, password].some((feild) => feild?.trim() === "")
    ) {
      throw new ApiError(400 , "All feilds are required") 
  }
   
  const existUser = await User.findOne({
     
     $or : [{ username } , { email }]
     
  })

  if(existUser){
    throw new ApiError(409 , "User existed already")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400 , "avatar file is required ")
  }

  const avatar = await uploadOnCloudibary(avatarLocalPath);
  const coverImage  = await uploadOnCloudibary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400 , "avatar file is required ")
  }
  
   console.log(avatar.url);

  const user = await User.create({
    fullName ,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
   
   if (!createdUser) {
      throw new ApiError(500 , "something went wrong while registration")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered succefully")
   )
   
})



export {registerUser} 