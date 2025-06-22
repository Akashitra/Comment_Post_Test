const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const postmodel = require("../Model/PostModel")
const posting = require("../Model/Post")
const likecomment = require("../Model/likeComment");
const { default: mongoose } = require('mongoose');
const likeComment = require('../Model/likeComment');

class UserController{
  async register(req,res){
    try{
        const {name,email,password} = req.body;
        const emailexists = await postmodel.findOne({email:email});
        if(emailexists){
            return res.status(402).json({
                Message:"User already exists"
            })
        }
        const hashpassword = await bcrypt.hash(password,10);
        const user = await postmodel.create({
            name:name,
            email:email,
            password:hashpassword
        });
        await user.save();
        res.status(200).json({
            Message:"User registered successfully....",
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

  async login(req,res){
    try{
      const {email,password} = req.body;
      const emailexists = await postmodel.findOne({email:email});
      if(!emailexists){
       return res.status(200).json({
        Message:"User not found.........."
       });
      } 

      if(emailexists.role !=='user'){
        return res.status(403).json({
          Message:"Only user can access this page......"
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

  async watch_all_postbyid(req,res){
    try{
      const id = req.params.id;
      const idexists = await posting.findById(id);
      if(!idexists){
        return res.status(402).json({
          Message:"No such found........"
        })
      }
      const all_comments = await posting.aggregate([
        {$match:{_id:new mongoose.Types.ObjectId(idexists.id)}},
        {
          $lookup:{
            from:"mrposts",
            localField:"AdminId",
            foreignField:"_id",
            as:"admin"
          }      
        },

        // {$unwind:"$admin"},
     
        {
          $lookup:{
            from:"likecomments",
            localField:"_id",
            foreignField:"PostId",
            as:"comment"
          }
        },
        // {
        //   $unwind:"$comment"
        // },
  {
          $lookup:{
            from:"mrposts",
            localField:"comment.userId",
            foreignField:"_id",
            as:"User"
          }
         },

        {
         $addFields:{
          totalComments:{$size:"$comment"},
          totalLikes:{
                   $size:{
                 $filter:{
                  input:"$comment",
                  as:"c",
                  cond:{$eq:["$$c.boolike",true]}
                 }
            }
          },
         totalDislikes:{
               $size:{
                    $filter:{
                      input:"$comment",
                      as:"c",
                      cond:{$eq:["$$c.boolike",false]}
                    }
               }
         }
          }
         },

       

        //  {
        //   $unwind:"$User"
        //  },

         {
          $project: {
    _id: 1,                      // Posting ID
    post: 1,                     // Text of the post
    createdAt: 1,                // When the post was created

    // Admin info (from mrpost via AdminId)
    "admin._id": 1,
    "admin.name": 1,
    "admin.email": 1,
    "admin.role": 1,

    // Comment info (from likecomment via CommentId)
    "comment._id": 1,
    "comment.comment": 1,
    "comment.like": 1,
    "comment.boolike":1,
    "comment.createdAt": 1,

    // Commenting user info (from mrpost via comment.userId)
    "User._id": 1,
    "User.name": 1,
    "User.email": 1,
    "User.role": 1,
     totalComments:1,
     totalLikes:1,
     totalDislikes:1
     
  }
         }
      ]);
res.status(200).json({
  Message:"On Post user comments and all",
  Comment_details:all_comments 
})

    }

    catch(error){
         res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
    }
  }


  async watch_all_posts(req,res){

    try{
             const users = await postmodel.find();
             const admins = users.filter((user)=>user.role === 'admin');
             console.log(admins);
             
             const details = await Promise.all(admins.map(async (admin)=>{
                         const all_details = await posting.aggregate([
                          {$match:{AdminId:admin._id}},

                          {
                            $lookup:{
                              from:"mrposts",
                              localField:"AdminId",
                              foreignField:"_id",
                              as:"admin"
                              
                            }
                          },
                          // {
                          //   $unwind:'$admin'
                          // },
                          {
                           $lookup:{
                            from:"likecomments",
                            localField:"PostId",
                            foreignField:"_id",
                            as:"comment"
                           }
                          },
                        
                          {
                           $lookup:{
                            from:"mrposts",
                            localField:"comment.userId",
                            foreignField:"_id",
                            as:"user"
                           }
                          },

                          {
                         $project: {
                          _id: 1,
                          post: 1,
                           "admin._id": 1,
                         "admin.name": 1,
                        "admin.email": 1,
                       "admin.role": 1,
                       "comment.comment":1,
                       "comment.like":1,
                       "comment.boolike":1,
                       "user.name":1,
                       "user.email":1
                            }
                          }


                        ]);

                         return all_details
             }));
    
          res.status(201).json({
            Message:"All posts are....",
            Posts:details
          })
    }
    catch(error){
       res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
    }
  }
  async comment_on_postbyid(req,res){
    try{
           const id = req.params.id;
           const idexists = await  posting.findById(id);
           console.log(idexists);
           
           if(!idexists){
            return res.status(404).json({
                Message:"Id dont't exists........"
            })
           }
           const admincheck = await postmodel.findById(idexists.AdminId);
           if(admincheck.role !== 'admin'){
            return res.status(400).json({
              Message:"Sorry this is not an admin post....."
            })
           }

           const {comment,like} = req.body;
           if(like !== "like" && like !=="dislike"){
            return res.status(400).json({
              Message:"Please enter valid like or dislike......"
            })
           }

           const commentlike = await likecomment.create({
            PostId:idexists.id,
            userId:req.user.id,
            comment:comment
           });
           if(like){

            commentlike.like = like;
            await commentlike.save();
           }

           if(like === "like"){
              commentlike.boolike = true,
              await commentlike.save();
           }
          else if(like === "dislike"){
                 commentlike.boolike = false;
                 await commentlike.save()
          }
          else{
            res.status(400).json({
              Message:"Pleas give proper reaction....."
            })
          }
           console.log("Comments");
           console.log(commentlike);
           
         const post_details = await likecomment.aggregate([
          {$match:{
            _id:new mongoose.Types.ObjectId(commentlike._id),
            PostId:idexists._id,
            userId:new mongoose.Types.ObjectId(req.user.id)
          }},

          {
          $lookup:{
             from:"postings",
           localField:"PostId",
           foreignField:"_id",
           as:"post"
          }
          },
          { $unwind: "$post" },
            {
              $lookup:{
                from:"mrposts",
                localField:"post.AdminId",
                foreignField:"_id",
                as:"admin"
              }
            },
        { $unwind: "$admin" },
            {
             $lookup:{
              from:"mrposts",
             localField:"userId",
             foreignField:"_id",
             as:"user" 
             }
            },
            {
               $unwind:"$user"
            },
            {
              $project:{
                _id:1,
                "post.post":1,
                "admin.name":1,
                "admin.email":1,
                comment:1,
                boolike:1,
                like:1,
                UserName:"$user.name",
                UserEmail:"$user.email"
              }
            }
         ]);
           
           res.status(400).json({
            Message:"User action added",
            Check:post_details.flat()
           })


    }
     catch(error){
         res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
    }
  }
  
  async editcomment(req,res){
    try{
            const id = req.params.id;
            const commentexists = await likecomment.findOne({_id:id,userId:req.user.id});
            if(!commentexists){
              return res.status(404).json({
                Message:"Comment does'nt exists........."
              })
            }
            const {comment,like}=req.body;
            if(comment){
          await likecomment.findOneAndUpdate({_id:id,userId:req.user.id},{
              comment:comment
          },{
            new:true
          })  
        }
        if(like){
          if(like === "like")
          await likecomment.findOneAndUpdate({_id:id,userId:req.user.id},{
           boolike:true
          },{
            new:true
          });
          else if(like==="dislike")
            await likecomment.findOneAndUpdate({_id:id,userId:req.user.id},{
           boolike:false
          },{
            new:true
          });
        }
res.status(200).json({
  Message:"Updated successfully........."
})
      
    }
    catch(error){
       res.status(500).json({
            Message:"Error Occured.....",
            Error:error.message
        })
    }
  }
  
  
  
  
}

module.exports = new UserController;