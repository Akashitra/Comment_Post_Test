const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const postmodel = require("../Model/PostModel")
const posting = require("../Model/Post")
const likecomment = require("../Model/likeComment");
const { default: mongoose } = require('mongoose');
const likeComment = require('../Model/likeComment');

class AdminController{
 async login(req,res){
    try{
      const {email,password} = req.body;
      const emailexists = await postmodel.findOne({email:email});
      if(!emailexists){
       return res.status(200).json({
        Message:"User not found.........."
       });
      } 

      if(emailexists.role !=='admin'){
        return res.status(403).json({
          Message:"Only Admin can access this page......"
        })
      }

      const isMatch = await bcrypt.compare(password,emailexists.password);
      if(!isMatch){
        return res.status(400).json({
            Message:"Password does'nt match...."
        })
      }
      const payload = {
        id:emailexists.id,
        name:emailexists.name,
        email:emailexists.email,
        role:emailexists.role
      }
      
      const token = await jwt.sign(payload,process.env.User_Secret_Key,{expiresIn:"2hr"});

      res.status(200).json({
        Message:"Login Done successfully for User...",
        token:token
      })
    }
    catch(error){
         res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
    }
  }
  
async create_post(req,res){
  try{
          const {post} = req.body;
        const user =   await posting.create({
            post:post,
            AdminId:req.user.id
          });
          await user.save();

          res.status(201).json({
            Message:"Post Created successfully...",
            User:user
          })
  }
  catch(error){
     res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
  }
}

async see_my_post(req,res){
  try{
        const all_post  = await posting.find({AdminId:req.user.id});
     
        res.status(400).json({
          Message:"Hence all posts are...",
          Post:all_post
        })
  }
  catch(error){
     res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
  }

}


  async watch_all_admin_post(req,res){
    try{
        const users= await postmodel.find();
         const admins = users.filter(user=>user.role==='admin')
        const all_details = await Promise.all(admins.map(async (admin)=>{
          const details = await posting.aggregate([
            {$match:{AdminId:admin.id}},
            {
              $lookup:{
                from:likecomment,
                localField:"PostId",
                foreignField:"_id",
                as:"comment"
              }
            },

            {
              $unwind:"$comment"
            },
             {
              $lookup:{
                from:postmodel,
                localField:"_id",
                foreignField:"$comment.userId",

              }
             },
            {

            }

          ]);

          return details;
        }));

        res.status(400).json({
          Message:"Hence all posts are...",
          Post:all_post
        });

    }
    catch(error){
         res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
    }
  }


  async see_post_by_id_with_comments_andlikes(req,res){
    try{
  
    }
    catch(error){

    }
  }

  


// async watch_all_like_comment_on_post(req,res){
//   try{

//   }
//   catch(error){
//          res.status(500).json({
//             Message:"Error Occured.....",
//             Error:error.message
//         })
//     }
//   }

}
module.exports = new AdminController;