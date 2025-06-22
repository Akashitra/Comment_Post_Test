const jwt =require("jsonwebtoken");
const  UserAuth = async(req,res,next) =>{
const token =
  req.cookies?.token ||                                 // from cookie
  req.body?.token ||                                    // from POST body
  req.query?.token ||                                   // from URL query
  req.headers['access_it'] ||                           // custom header
  req.headers.authorization?.split(" ")[1]; 
  
if(!token){
    return res.status(status_code.forbidden).json({
        Message:"Invalid Token"
    })
}
try{
 const decoded = await jwt.verify(token,process.env.User_Secret_Key);
if(decoded.role !== 'user'){
    return res.status(403).json({
        Message:"Sorry! only  can user can access this page...."
    })
}
req.user = decoded;
next();
}
catch(error){
        res.status(500).json({
            Message:"Error ocucured....",
            Error:error           
        })
    }  
}

module.exports = UserAuth