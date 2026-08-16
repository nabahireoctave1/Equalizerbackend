const {body,validationResult}=require('express-validator');
const {escapeHtmlChar}=require('../HtmlCHars')


const validatecashierRequest=[
    body('names').notEmpty().withMessage('Please names required !').customSanitizer(escapeHtmlChar),
    body('email').optional({nullable:true}).customSanitizer(escapeHtmlChar),
    body('location').notEmpty().withMessage('Please location required !').customSanitizer(escapeHtmlChar),
    body('phoneno').notEmpty().withMessage('Please phone number required !').isNumeric().withMessage('phone number must be number !')
    .isLength({min:10,max:10}).withMessage('Phone number must be number !'),
    body('branch').notEmpty().withMessage('Branch name required!').customSanitizer(escapeHtmlChar)
    ,(req,res,next)=>{
  const errors=validationResult(req)
  if(!errors.isEmpty()){
    const formattedErrors= {};
     errors.array().forEach((err)=>{
        if(!formattedErrors[err.path]){
        formattedErrors[err.path]=err.msg
    }
  })
   return res.status(400).json({errors:formattedErrors})

  }

  next();
  
    }
]



module.exports=validatecashierRequest;