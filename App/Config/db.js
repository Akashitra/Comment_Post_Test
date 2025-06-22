const mongoose = require("mongoose");

const moncon = async()=>{
    const connection = await mongoose.connect(process.env.Mongo_Url,{dbName:process.env.DB_NAME});
    if(connection){
       console.log("Database connection done successfully.......");
    }
    else{
        console.log("Connection failed.....");
        
    }
}
module.exports = moncon;