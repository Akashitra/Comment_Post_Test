const express = require("express");
const AdminRouter = express.Router();
const AdminAuth = require("../Middleware/AdminAuth");
const AdminController = require("../Controller/AdminController");
AdminRouter.post('/login',AdminController.login);

AdminRouter.use(AdminAuth);
AdminRouter.post('/create_post',AdminController.create_post)
module.exports = AdminRouter;