import mongoose , {Schema} from "mongoose"

const tweetsSCHEMA = new Schema({
  owner : {
    type : Schema.Types.ObjectId,
    ref : "User"
  },
  content : {
    type : String,
    require : true,
  }
},{timestamps : true})

export const Tweets = mongoose.model("Tweets" , tweetsSCHEMA)