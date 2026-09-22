
const {body,validationResult}=require('express-validator')


const validatePayments= [
  
    body('client_name').notEmpty().withMessage('client.client_name_required').trim(),
    body('paymentAmount').notEmpty().withMessage('client.paymentamount_required').bail()
    .isNumeric().withMessage('client.amount_is_numeric').isLength({min:0}).withMessage('client.amountMax_amountIs')
  ,(req,res,next)=>{

    const errors= validationResult(req);
    if(!errors.isEmpty()){
      let formattedError={};

        errors.array().map((err)=>{
            if(!formattedError[err.path]){
            formattedError[err.path]=err.msg;
            }   
        })
    
        return res.status(400).json({errors:formattedError})
    }
    next();

  } 

]

module.exports=validatePayments