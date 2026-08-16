const multer= require('multer')
const path=require('path');

const storage=
multer.diskStorage({
    destination:(req,file,cb)=>{
    cb(null,"uploads/profile")
 },
 
 filename:(req,file,cb)=>{
    const ext=path.extname(file.originalname);
    cb(null,`user-${req.user.userId}-${Date.now()}${ext}`);
 }
});


const Filefilter=(req,file,cb)=>{
    if(file.mimetype.startsWith("image/")){
        console.log(file.originalname)
        cb(null,true);
    }
    else{
       
         cb(null,false)
    }
}


const upload=multer({
    storage:storage,
    fileFilter:Filefilter,
    limits:{
        fileSize:5*1024*1024
    }
})


module.exports=upload;