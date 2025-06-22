const express =require("express");
const UserRouter = express.Router();
const UserAuth = require("../Middleware/UserAuth");
const UserController = require("../Controller/UserController")
UserRouter.post('/register',UserController.register); 
UserRouter.post('/login',UserController.login);

UserRouter.use(UserAuth);
UserRouter.get('/watch_all_post',UserController.watch_all_posts)
UserRouter.get('/watch_all_postbyid/:id',UserController.watch_all_postbyid);
UserRouter.post('/comment_on_postbyid/:id',UserController.comment_on_postbyid);
UserRouter.post('/edit_comment/:id',UserController.editcomment)
module.exports = UserRouter;