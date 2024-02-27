import mongoose , {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

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

videoSchema.plugin(mongooseAggregatePaginate)

export const Comments = mongoose.model("Comments" , commentSchmea)