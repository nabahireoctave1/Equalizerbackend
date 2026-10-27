const multer= require('multer');
const path=require('path');



const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/collateral_uploads')
    },
    
    filename:(req,file,cb)=>{
        const ext= path.extname(file.originalname)
        cb(null,`collateral-${req.body.LoanId}-${Date.now()}${ext}`);
    }

})

let fileFilter= (req,file,cb)=>{
    if(file.mimetype.startsWith('image/')){
        cb(null,true);
    }

    cb(null,false);



}


const Upload= multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{
        fileSize:5*1024*1024

    }
})


module.exports=Upload;