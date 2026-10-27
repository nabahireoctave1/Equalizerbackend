
  const {body,validationResult}=require('express-validator');


  const ValidateCashierProfileInformation= [
    body('names').notEmpty().withMessage('cashier.names_required').trim(),
    body('Contact').trim().notEmpty().withMessage('cashier.phone_num_required').bail()
    .isNumeric().withMessage('cashier.phone_no_must_be_numeric').isLength({min:10,max:10})
    .withMessage('cashier.phone_number_islength'),
   body('location').trim().notEmpty().withMessage('cashier.location_required').trim(),
   body('email').trim().notEmpty().withMessage('cashier.email_required').bail().isEmail()
   .withMessage('Invalid Email').normalizeEmail(),

   (req,res,next)=>{
   
    const errors= validationResult(req);
    console.log(errors)

    if(!errors.isEmpty()){
        const formattedErrors={};
      
        errors.array().map((err)=>{
            if(!formattedErrors[err.path]){
                formattedErrors[err.path]=err.msg;
            }
        })

          return res.status(400).json({error:formattedErrors})
    }

    next();


   }

  ]

  module.exports=ValidateCashierProfileInformation

