import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const user = req.user._id;
    const video = req.params;

    if(!user){
        throw new ApiError(400, "User not found");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : user,
        videos : video
     })

     if(!playlist){
         throw new ApiError(500, "Playlist not created");
     }

     return res.status(201).json(
         new ApiResponse(201, {playlist}, "Playlist created successfully")
     )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const allPlaylist = await Playlist.find({
        owner : new mongoose.Types.ObjestId(userId)
    })

    if(!allPlaylist){
        throw new ApiError(404, "No playlist found");
    }

    return res.status(200).json(
        new ApiResponse(200, {allPlaylist}, "Success")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(200, {playlist}, "Success")
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    // const playlist = await Playlist.findById(playlistId);

    const adddVedio = await Playlist.UpdateOne({
        _id :playlistId
    },{
        $push : {
            videos : videoId
        }
    })

    if(!adddVedio){
        throw new ApiError(500, "Error adding video to playlist");
    }
     
    return res.status(201).json(
        new ApiResponse(201, {adddVedio}, "Video added to playlist")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}