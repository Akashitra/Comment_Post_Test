require("dotenv").config();
const express = require("express");
const path = require("path");
const db = require("./App/Config/db");
db();
const app = express();
const port = 3002;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tryrouter = require("./try");
app.use(tryrouter);

const AdminRouter = require("./App/Router/AdminRouter");
app.use('/admin',AdminRouter);

const UserRouter = require("./App/Router/UserRouter");
app.use('/user',UserRouter);


app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
    
})