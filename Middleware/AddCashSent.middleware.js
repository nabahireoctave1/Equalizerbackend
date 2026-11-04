
const {body,validationResult}=require('express-validator');


const ValidateSent= [

  body('To').trim().notEmpty().withMessage('c.send_to_required'),
  body('amount').trim().notEmpty().withMessage('c.amount_required')
  .bail().isFloat({min:0}).withMessage('c.amount_must_not_be_negative'),

  (req,res,next)=>{
    let errors= validationResult(req);
    if(!errors.isEmpty()){
    let formattedErrors={};
    
    errors.array().map((err)=>{
        if(!formattedErrors[err.path]){
            formattedErrors[err.path]=err.msg;
        }
    })

    return res.status(400).json({error:formattedErrors});
    }

    next();
  }

]



module.exports= ValidateSent;



