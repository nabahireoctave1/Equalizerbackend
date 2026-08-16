
const {body,validationResult}=require('express-validator')


const validateSMSPackageInputs= [
    body('smsPackage').notEmpty().withMessage('Please enter SMS package').bail().isNumeric().withMessage('SMS pakage must be number'),
    body('PaymentNumber').notEmpty().withMessage('Please enter Phone number').bail().isNumeric().withMessage('Phone number must be number')
    .isLength({min:10,max:10}).withMessage('Phone number must be 10 digits'),
    (req,res,next)=>{

   const errors= validationResult(req);
  
   if(!errors.isEmpty()){

    let formattedErrors={}
    
    errors.array().forEach((err)=>{
if(!formattedErrors[err.path]){formattedErrors[err.path]=err.msg;}
    })

    return res.status(400).json({Errors:formattedErrors})
   }
 
   next();

    }
]


module.exports=validateSMSPackageInputs;


