const {body,validationResult}=require('express-validator')

const validateInfo=[

body('client_name').notEmpty().withMessage('client.client_names_required').trim(),
body('client_address').notEmpty().withMessage('client.client_address_required').trim(),
body('client_contact').notEmpty().withMessage('client.contact_required')
.bail().isLength({min:10,max:10}).withMessage('client.contact_length')
.isNumeric().withMessage('client.contact_isnumeric'),
body('IdNumber').notEmpty().withMessage('client.Id_required')
.bail().isLength({min:16,max:16}).withMessage('client.Id_length')
.isNumeric().withMessage('client.Id_isnumeric'),
body('client_B_type').notEmpty().withMessage('client.bussiness_type_required'),
body('client_B_location').notEmpty().withMessage('client.bussiness_location_required'),
body('amount').notEmpty().withMessage('client.applied_amount_required').bail().isNumeric()
.withMessage('client.amount_isnumeric').isLength({min:0}).withMessage('client.max_amount'),
body('payment_frequency').notEmpty().withMessage('client.payment_frequency_not_setted'),
body('intrest').notEmpty().withMessage('client.intrest_profit_ration_not_setted'),
body('security_name').notEmpty().withMessage('client.collateral_name_required'),
body('secNumber').notEmpty().withMessage('client.secNumber_required').
isNumeric().withMessage('client.secnum_isnumeric'),
 body('guarantor_name').notEmpty().withMessage('client.guarantor_names_required'),
 body('guarantor_contact').notEmpty().withMessage('client.guarantor_contact_required'),
 body('guarantor_address').notEmpty().withMessage('client.guarantor_address_required'),
 body('cashier_name').notEmpty().withMessage('client.loan_approved_by_cashier_required'),
 body('installment').notEmpty().withMessage('client.daily_installment_required').bail().isLength({min:0})
 .withMessage('client.daily_installment_Islength').isNumeric().withMessage('client.daily_installment_Is'),

 (req,res,next)=>{

    const errors= validationResult(req);
     if(!errors.isEmpty()){
        let formattederror={}

        errors.array().forEach((err)=>{
            if(!formattederror[err.path]){
             formattederror[err.path]=err.msg
            }
        }) 

        return res.status(400).json({errors:formattederror})

     }

     next();
    
    


 }



]



module.exports=validateInfo