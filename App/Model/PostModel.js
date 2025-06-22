const mongoose = require('mongoose');
const { type } = require('os');
const PostSchema = new mongoose.Schema({
    name:{
         type:String,
         require:true        
    },
    email:{
        type:String,
        require:true,
        unique:[true,"Email must be unique"]
    },
    password:{
        type:String,
        required:true
    },
  
   
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
},{
    timestamps:true
});
module.exports = mongoose.model("mrpost",PostSchema);