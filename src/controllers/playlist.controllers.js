import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"



const userisOwner = async (userId, playlistId) => {

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString() !== userId){
        throw new ApiError(403, "You are not the owner of this playlist");
    }
    return true;

}

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400, "Name and description are required");
    }

    const user = req.user._id;

    if(!user){
        throw new ApiError(400, "User not found");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : user,
        videos : []
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

  

    const {playlistId, videoId} = req.params;

    const auth = userisOwner(req.user._id, playlistId);

    if(!auth){
        throw new ApiError(403, "You are not the owner of this playlist");
    }

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
    const {playlistId} = req.params;

    const auth = userisOwner ( req.user._id, playlistId );

    if(!auth){
        throw new ApiError(300, "You are not the owner of this playlist");
    }
    
    const removeVedio = await Playlist.findByIdAndDelet( playlistId );

    if(!removeVedio){
        throw new ApiError(500, "Error removing video from playlist");
    }

    return res.status(200).json( new ApiResponse( 200, {removeVedio}, "Video removed from playlist" ));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    const auth = userisOwner ( req.user._id, playlistId );

    if(!auth){
        throw new ApiError(300, "You are not the owner of this playlist");
    }
    
    const deletePlaylist = await Playlist.deleteOne({
        _id : playlistId
    })

    if(!deletePlaylist){
        throw new ApiError(500, "Error deleting playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, {deletePlaylist}, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    const auth = userisOwner ( req.user._id, playlistId );

    if(!auth){
        throw new ApiError(300, "You are not the owner of this playlist");
    }

    const upgradePlaylist = await Playlist.findByIdAndUpdate(playlistId , {
        name,
        description
    }, {new : true}
    )

    if(!upgradePlaylist){
        throw new ApiError(500, "Error updating playlist");
    }

    return res.status(200).json(
        new ApiResponse(200, {upgradePlaylist}, "Playlist updated successfully")
    )
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