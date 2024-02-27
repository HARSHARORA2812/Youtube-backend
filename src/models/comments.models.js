import mongoose , {Schema} from "mongoose"

const commentSchmea = new Schema({
  content : {
    type : String,
    required : true,
  },
  owner : {
    type : Schema.Types.ObjectId,
    ref : "User",
  },
  video : {
    type : Schema.Types.ObjectId,
    ref : "Video",
  }
})

export const Comments = mongoose.model("Comments" , commentSchmea)