import mongoose , {Schema} from "mongoose"

const likeSchema = new Schema({
  comments : {
    type : Schema.Types.ObjectId,
    ref : "Comments",
  },
  Video : {
    type : Schema.Types.ObjectId,
    ref : "Video",
  },
  likedBy : {
    type : Schema.Types.ObjectId,
    ref : "User",
  },
  tweet : {
    type : Schema.Types.ObjectId,
    ref : "Tweets",
  },

},{timestamps : true})

export const Like = mongoose.model("Like" , likeSchema)
