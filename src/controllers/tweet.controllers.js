import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const owner = await req.user._id

    if(!user){
        throw new ApiError(400 , "Invalid request");
    }

    const {content} = await req.body

    if(!content){
        throw new ApiError(400 , "messege is required");
    }

    const tweet = await Tweet.create({
        owner,
        content,

    })

    if(!tweet){
        throw new ApiError(500 , "Tweet not created");
    }

    return res.status(201).json(
        new ApiResponse(200,tweet,"tweet created succefully")
       )

})

const getUserTweets = asyncHandler(async (req, res) => {

    const {userId} = req.params

    if(!userId){
        throw new ApiError(400 , "Invalid request");
    }

    const user = await User.findbyId(userId)

    if(!user){
        throw new ApiError(400 , "user not found");
    }

    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner : mongoose.Types.ObjectId(userId)
            // if this shows error should try "userId"
            }
        }
    ])

    if(!tweets){
        throw new ApiError(500 , "No tweets found");
    }

    return res.status(200).json(
        new ApiResponse(200,tweets,"tweets found succefully")
       )
})

const updateTweet = asyncHandler(async (req, res) => {

    const tweet = await Tweet.findByIdAndUpdate({
        _id:req.params.id,
        owner:req.user._id
    },{
        content:req.body.content
    },{
        new:true
    })

    if(!tweet){
        throw new ApiError(500 , "Tweet not updated");
    }

    return res.status(200).json(
        new ApiResponse(200,tweet,"tweet updated succefully")
       )
})

const deleteTweet = asyncHandler(async (req, res) => {

    const tweet = await Tweet.findById(req.params.id)

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this tweet!");
    }
    
    await Tweet.findByIdAndDelete({
        _id:req.params.id,
        owner:req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200,tweet,"tweet deleted succefully")
       )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}