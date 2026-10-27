 const {body,validationResult}= require('express-validator');

 const ValidateNewLoanRequest=[

   body('clientID').trim().notEmpty().withMessage('client.clientId_required').bail().isNumeric()
   .withMessage('client.clientId_Isnumeric').isLength({min:6,max:6}).withMessage('client.Id_LenghtIs'),
   body('Loanamount').trim().notEmpty().withMessage('client.loan_amount_required')
   .bail().isFloat({min:0}).withMessage('client.min_length'),
   body('guarantor').trim().notEmpty().withMessage('client.guarantor_required'),
   body('guarantorContact').trim().notEmpty().withMessage('client.guarantor_contact_required')
   .bail().isLength({min:10,max:10}).withMessage('client.phone_number_isLength'),
   body('guarantorAddress').trim().notEmpty().withMessage('client.gurantor_address_required'),
   
   
   (req,res,next)=>{ 

    const errors= validationResult(req);

    if(!errors.isEmpty()){
        let formatedErrors={};
          
    errors.array().forEach((err)=>{
        if(!formatedErrors[err.path]){
            formatedErrors[err.path]=err.msg;
        }
    })

    return res.status(400).json({error:formatedErrors})
     }

     next();

   }


 ]

 module.exports=ValidateNewLoanRequest;