import { ApiError } from "../utils/apiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudibary , deleteFromCloudinary} from "../utils/cloudnery.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const GenerateAccessAndRefreshToken = (async(userId)=>{
  try {
     
   const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave : false })

    return {accessToken , refreshToken}
      

  } catch (error) {
     throw new ApiError(500,"Something Went Wrong while generating access and refresh tokens");
  }
})

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

const loginUser = asyncHandler(async (req,res) => {
  
    const {email , username , password} = req.body;

    if(!email && !username){
      throw new ApiError(401,"Email or Username Required")
    }

    const user = await User.findOne({
      $or: [{username }, {email}]
    })

    if(!user){
      throw new ApiError(404 , "user does not exist" );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
   
    if(!isPasswordValid){
      throw new ApiError(404 , "Invalid User Credenctals" );
    }

    const {accessToken , refreshToken} = await GenerateAccessAndRefreshToken(user._id);
    
    const loggedInUser =await User.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly : true,
      secure : true,

    } 

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json( new ApiResponse(
      200,
      {
        user : loggedInUser , accessToken , refreshToken
      },
      "user logged in successfully"
      ))
})

const logOutUser = asyncHandler(async (req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
       $set : {refreshToken : undefined }
    },
    {
      new : true
    }
  )
  const options = {
    httpOnly : true,
    secure : true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {} , "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken ;
  
  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }

  const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECREAT);

  const user = await User.findById(decodedToken?._id)
  
  if(!user){
    throw new ApiError(401,"Invalid Refresh Token");
  }
   
  if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(402,"Refresh token is expired or used")
  }

  const options = {
    httpOnly : true,
    secure : true
  }

  const {newaccessToken , newrefreshToken} = await GenerateAccessAndRefreshToken(user._id);

  return res
  .status(200)
  .cookie("access Token" , newaccessToken , options)
  .cookie("refresh Token" , newrefreshToken , options)
  .json(
    new ApiResponse(
      200,
      {
        
        accessToken , refreshToken

      },
      "Access Token Refreshed")
  )

})

const changeCurrentPassword = asyncHandler(async (req,res) => {
  
  const {oldPassword , newPassword} = req.body;

  const user = await User.findOne(req.user?._id)

  const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }

  user.password = newPassword
  user.save({validateBeforeSave : false})

  return res
  .status(200)
  .json( new ApiResponse(200 , {} , "Password Changed Sucessfully"))
   
})

const getCurrentUser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "Current user fetched sucessfully"))
    
})

const updateAcountDetails = asyncHandler(async (req,res) => {

   const {fullName , email } = req.body

   if(!fullName || !email){
    throw new ApiError(400 , "All feilds are required ")
   }
   User.findByIdAndUpdate(
       req.user?._id,
       {

         $set: {
           fullName,
           email,
         }

       },
       {new : true}
       
       ).select("-password")

       return res
       .status(200)
       .json( new ApiResponse(200, "Acount details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res) => {

  // const usER = await User.findById(req.user._id)

  // const oldAvatar = usER.avatar;

  const avatarLocalPath = req.file?.path

  if (!updateUserAvatar) {
   throw new ApiError(400 , "Avatar file is missing")
  }

  const avatar = await uploadOnCloudibary(avatarLocalPath)

  if (!avatar) {
    throw new ApiError(400,"Error while uploding avatar")
  }

   const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set : {
        avatar : avatar.url
      }
    } ,
    {new : true}).seclect("-password")

    // await deleteFromCloudinary(oldAvatar);

    return res
    .status(200)
    .json( new ApiResponse(200 , user , "Avatar Uploded"))



})

const updateUserCoverImage = asyncHandler(async(req,res) => {

  const coverImageLocalPath = req.file?.path

  const usER =await findById(req.user._id)

  const oldcoverImage = usER.coverImage;

  if (!updateUserCoverImage) {
   throw new ApiError(400 , "CoverImage file is missing")
  }

  const CoverImage = await uploadOnCloudibary(coverImageLocalPath)

  if (!CoverImage) {
    throw new ApiError(400,"Error while uploding avatar")
  }

  const user =  await User.findByIdAndUpdate(req.user?._id,
    {
      $set : {
        CoverImage : CoverImage.url
      }
    } ,
    {new : true}) .seclect("-password")

    await deleteFromCloudinary(oldcoverImage);

    return res
    .status(200)
    .json( new ApiResponse(200 , user , "CoverImage Uploded"))

})

const getUserChannelProfile = asyncHandler(async (req,res) => {
  const {username} = req.params

  if (!username?.trim()) {
    throw new ApiError(400,"User name is missing");
  }
  
  const channel = await User.aggregate([
    {
      $match : {
        username : username?.toLowerCase()
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localField : "_id",
        foreignField : "channel",
        as : "subscribers"
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localField : "_id",
        foreignField : "subscriber",
        as : "subscribedTo"
      }
    },
    {
      $addFields : {
        subscriberCount : {
          $size : "$subscribers"
        },
        channelsSubscribesToCount : {
          $size : "$subscribedTo"
        },
        isSubscribed : {
          if : {$in : [req.user?._id,"$subscribers.subscriber"]},
          then : true,
          else : false
        }
      }
    },
    {
      $project : {
        fullname : 1,
        username : 1,
        subscriberCount : 1,
        channelsSubscribesToCount : 1,
        isSubscribed : 1 ,
        avatar : 1,
        coverImage : 1,
        email : 1 
      }
    } 

  ])

    if(!channel?.length){
      throw new ApiError(404 , "channel does not exists")
    }
    
   return res
   .status(200)
   .json( new ApiResponse(200 , channel[0] , "User channel featched successfully "))

})

const getWatchHistory = asyncHandler(async (req,res) => {

  const user = await User.aggregate([
    {
      $match : {
          _id : new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup : {
        from : "videos",
        localField : "watchHistory",
        foreignField : "_id",
        as : "watchHistory",
        pipeline : [
          {
            $pipeline : {
              from : "users",
              localField : "owner",
              foreignField : "_id",
              as : "owner",
              pipeline : [{
                fullName : 1,
                user : 1 ,
                avatar : 1
              }]
            }
          },
          {
            $addFields : {
              owner : {
                $first : "$owner"
              }
            }
          }
        ]
      }
    },
  ])

  return res
  .status(200)
  .json( new ApiResponse(200 , user[0].watchHistory , "watch History featched successfully"))  

})
 


export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword ,
  getCurrentUser,
  updateAcountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
} 