const express = require("express");
const tryrouter = express.Router();
tryrouter.get('/mongo',async (req,res)=>{
try{
res.status(200).json({
    Message:"Ok"
})
}
catch(error){
    res.status(500).json({
        Message:"Internal Server Error....",
        Error:error.message
    })
}
})
module.exports = tryrouter