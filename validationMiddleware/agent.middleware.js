
const {body,validationResult}=require('express-validator')
const {escapeHtmlChar}=require('../HtmlCHars')



const ValidateAgentInfo= [
   body('names').trim().notEmpty().withMessage('names required!').bail()
   .customSanitizer(escapeHtmlChar),
   body('phone').trim().notEmpty().withMessage('phone number required!').bail()
   .isLength({min:10,max:10}).withMessage('phone number must be 10 digits!').isNumeric()
   .withMessage('phone number must be number!'),
   body('email').trim().notEmpty().withMessage('email required!').bail().isEmail().withMessage('Invalid email format').normalizeEmail(),
   body('location').trim().notEmpty().withMessage('location required!').customSanitizer(escapeHtmlChar),
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


