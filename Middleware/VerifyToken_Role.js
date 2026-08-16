require('dotenv').config();
const jwt= require('jsonwebtoken')

const VerifyToken= (req,res,next)=>{
    try{
        const token= req.headers.authorization?.split(' ')[1]
        if(!token){
            return res.status(401).json({message:"Permission denied"})
        }

        const decoded= jwt.verify(token,process.env.JWT_SEC);
   
    req.user=decoded;
    next()
        


    }
    catch(err){
      return res.status(403).json({message:"invalid token"})
    }
} 


const VerifyRole= (...allowedrole)=>{
    return (req,res,next)=>{
    if(!req.user||!req.user.role){
        return res.status(401).json({message:"permission denied"})

    }
    if(allowedrole.includes(req.user.role)){
        next();
    }
    else{
        return res.status(401).json({message:"permission denied"})

    }
}

}


module.exports={
    VerifyToken,VerifyRole
}



