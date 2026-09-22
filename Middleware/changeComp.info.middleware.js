
const {body,validationResult}=require('express-validator');


const ValidatechangedCompInfo= [
 body('companyName').notEmpty().withMessage('Company name required !'),
 body('companyAdmin').notEmpty().withMessage('Company admin name required !'),
 body('companyLocation').notEmpty().withMessage('Company  operating location required !'),

 (req,res,next)=>{

    const errors=validationResult(req);


    if(!errors.isEmpty()){
        const formattederrors={};
    errors.array().forEach(err=>{
        if(!formattederrors[err.path]){
            formattederrors[err.path]=err.msg;
        }
    })
    
    return res.status(400).json({Errors:formattederrors});

    }
    next();
 }



]


module.exports=ValidatechangedCompInfo;