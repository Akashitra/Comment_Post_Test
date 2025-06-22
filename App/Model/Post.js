const mongoose = require("mongoose");
const { type } = require("os");
const { ref } = require("process");
const PostSchema = new mongoose.Schema({
     post:{
        type:String
    },
   AdminId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"mrpost",
        require:true
    }

},{
    timestamps:true
});

module.exports = mongoose.model("posting",PostSchema);