const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
      like:{
        type:String,
        enum:['like','dislike'],
        default:null
    },

    boolike:{
        type:Boolean,
        default:null
    },
    comment:{
        type:String,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"mrpost",
        required:true
    },
    PostId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posting",
        required:true
    }

},{
    timestamps:true
});
module.exports = mongoose.model('likecomment',likeSchema)