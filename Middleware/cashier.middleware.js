const {body,validationResult}=require('express-validator');
const {escapeHtmlChar}=require('../HtmlCHars')


const validatecashierRequest=[
    body('names').notEmpty().withMessage('nc.validationMessage.names_require').customSanitizer(escapeHtmlChar),
    body('email').optional({nullable:true}).customSanitizer(escapeHtmlChar),
    body('location').notEmpty().withMessage('nc.validationMessage.location_required').customSanitizer(escapeHtmlChar),
    body('phoneno').notEmpty().withMessage('nc.validationMessage.phone_number_required')
    .isNumeric().withMessage('phone_is_numeric')
    .isLength({min:10,max:10}).withMessage('nc.validationMessage.phone_length'),
    body('branch').notEmpty().withMessage('nc.validationMessage.branch_required').customSanitizer(escapeHtmlChar)
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