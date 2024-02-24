import { ApiError } from "../utils/apiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudibary} from "../utils/cloudnery.js"
import { ApiResponse } from "../utils/apiResponse.js";

const GenerateAccessAndRefreshToken = async(userId)=>
{
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
}

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




export {
  registerUser,
  loginUser,
  logOutUser
} 