import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(400, "Invalid request");
    }

    const alreadyLiked = await Like.findOne({
        video : new mongoose.Types.ObjectId(videoId),
        user : req.user._id
    })

    if(!alreadyLiked){
        const like = await Like.create({
            video : videoId,
            user : req.user._id
        })

        if(!like){
            throw new ApiError(500, "Like not created");
        }

        return res.status(201).json(
            new ApiResponse(201, {like}, "Like created successfully")
        )
    }

    await Like.findByIdAndDelete(alreadyLiked._id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Like removed successfully")
    )


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    if(!commentId){
        throw new ApiError(400, "Invalid request");
    }

    const alreadyLiked = await Like.findOne({
        comment : new mongoose.Types.ObjectId(commentId),
        user : req.user._id
    })

    if(!alreadyLiked){
        const like = await Like.create({
            comment : commentId,
            user : req.user._id
        })

        if(!like){
            throw new ApiError(500, "Like not created");
        }

        return res.status(201).json(
            new ApiResponse(201, {like}, "Like created successfully")
        )
    }

    await Like.findByIdAndDelete(alreadyLiked._id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Like removed successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    const alreadyLiked = await Like.findOne({
        tweet : new mongoose.Types.ObjectId(tweetId),
        user : req.user._id
    })

    if(!alreadyLiked){
        const like = await Like.create({
            tweet : tweetId,
            user : req.user._id
        })

        if(!like){
            throw new ApiError(500, "Like not created");
        }

        return res.status(201).json(
            new ApiResponse(201, {like}, "Like created successfully")
        )
    }

    await Like.findByIdAndDelete(alreadyLiked._id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Like removed successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user._id;

    if(!user){
        throw new ApiError(400, "Invalid request");
    }

    const likedVideos = await Like.find({
        user,
        vedio : {
            $exists : true
        }.populate({ path : "video", select : "title thumbnail"})
    })

    if(!likedVideos){
        throw new ApiError(404, "No liked videos found");
    }

    return res.status(200).json(
        new ApiResponse(200, {likedVideos}, "Success")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}