import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { userisOwner } from "./playlist.controllers.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user._id;
    const channelStat = await Vedio.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            },
            {
                $lookup : {
                    from : "likes",
                    localField : "_id",
                    foreignField : "video",
                    as : "likes"
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "owner",
                    foreignField : "channel",
                    as : "subscribers"
                }
            
            },
            {
                $group : {
                    _id : null,
                    totalViews : {
                        $sum : "$views"
                    },
                    totalLikes : {
                        $sum : {
                            $size : "$likes"
                        }
                    },
                    totalSubscribers : {
                        $sum : {
                            $size : "$subscribers"
                        }
                    },
                    totalVideos : {
                        $sum : 1
                    }
                }
            
            },
            {
                $project : {
                    _id : 0,
                    totalViews : 1,
                    totalLikes : 1,
                    totalSubscribers : 1,
                    totalVideos : 1
                
            }
        }
    ])

    if(!channelStat){
        throw new ApiError(404, "No channel found");
    }

    return res.status(200).json(
        new ApiResponse(200, {channelStat}, "Success")
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
   const userId = req.user._id;

    const videos = await Video.find({
         owner : userId
    });

    if(!videos || videos.length === 0){
        throw new ApiError(404, "No videos found");
    }

    return res.status(200).json(
        new ApiResponse(200, {videos}, "Success")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }