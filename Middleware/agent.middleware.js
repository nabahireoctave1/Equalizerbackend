
const {body,validationResult}=require('express-validator')
const {escapeHtmlChar}=require('../HtmlCHars')



const ValidateAgentInfo= [
   body('names').trim().notEmpty().withMessage('Names required!').bail()
   .customSanitizer(escapeHtmlChar),
   body('phone').trim().notEmpty().withMessage('Phone number required!').bail()
   .isLength({min:10,max:10}).withMessage('Phone number must be 10 digits!').isNumeric()
   .withMessage('Phone number must be number!'),
   body('email').trim().notEmpty().withMessage('Email required!').bail().isEmail()
   .withMessage('Invalid email format').normalizeEmail(),
   body('location').trim().notEmpty().withMessage('Location required!')
   .customSanitizer(escapeHtmlChar),
   (req,res,next)=>{
   
    const errors= validationResult(req)
   
    if(!errors.isEmpty()){
        let formatedErrors={};
    errors.array().map(err=>{
        if(!formatedErrors[err.path]){
         formatedErrors[err.path]=err.msg;
        }
    })
    return res.status(400).json({errors:formatedErrors})
    }
    next();

   }
]


module.exports=ValidateAgentInfo;


