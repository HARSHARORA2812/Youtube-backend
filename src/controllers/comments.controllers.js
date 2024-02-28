import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {aggregatePaginate} from "mongoose-paginate-v2"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400 , "Invalid request");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const comments = await Comment.aggregate([
        {
            $match : {
                vidio :new mongoose.Types.ObjectId(videoId)
            }
        },

    ])

    if(!comments){
        throw new ApiError(404, "No comments found");
    }

    Comment.aggregatePaginate(aggregateComments, {
        page,
        limit
    })

    return res.status(200).json(
    new ApiResponse(200, { allComments }, "Success"));
  

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;
    const user = req.user._id;

    if(!content){
        throw new ApiError(400, "Invalid request");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "video not found");
    }

    const addComment = Comment.Create({
        content,
        user,
        video: videoId
    })

    if(!addComment){
        throw new ApiError(500, "Error adding comment");
    }

    return res.status(201).json(
        new ApiResponse(201, {addComment}, "Success")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;

    if(!commentId){
        throw new ApiError(400, "Invalid request");
    }

    const {content} = req.body?.content;

    if(!content){
        throw new ApiError(400, "Invalid request");
    }

    const Updatecomment = await Comment.findByIdAndUpdate(
        commentId ,
        {
            $set : {
                content
            }
        },
        {
            new : true
        }

        
        );

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {Updatecomment}, "Success")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    if (Comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this tweet!");
    }

    const {commentId} = req.params;

    if(!commentId){
        throw new ApiError(400, "Invalid request");
    }

    const comment = await Comment.findByIdAndDelete({
        _id : commentId
    
    })

    return res.status(200).json(
        new ApiResponse(200, {comment}, "Success")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }