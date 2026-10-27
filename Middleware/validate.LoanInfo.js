const {body,validationResult}=require('express-validator')

const validateInfo=[

body('client_name').notEmpty().withMessage('client.client_names_required').trim(),
body('client_address').notEmpty().withMessage('client.client_address_required').trim(),
body('client_contact').notEmpty().withMessage('client.contact_required').trim()
.bail().isLength({min:10,max:10}).withMessage('client.contact_length')
.isNumeric().withMessage('client.contact_isnumeric'),
body('IdNumber').notEmpty().withMessage('client.Id_required').trim()
.bail().isLength({min:16,max:16}).withMessage('client.Id_length')
.isNumeric().withMessage('client.Id_isnumeric'),
body('client_B_type').notEmpty().withMessage('client.bussiness_type_required').trim(),
body('client_B_location').notEmpty().withMessage('client.bussiness_location_required').trim(),
body('client_B_Name').notEmpty().withMessage('client.bussiness_name_required').trim(),
body('amount').notEmpty().withMessage('client.applied_amount_required').trim().bail()
.isFloat({min:0}).withMessage('client.max_amount'),
body('payment_frequency').notEmpty().withMessage('client.payment_frequency_not_setted').trim(),
body('intrest').notEmpty().withMessage('client.intrest_profit_ration_not_setted').trim(),
body('security_name').notEmpty().withMessage('client.collateral_name_required').trim(),
 body('guarantor_name').notEmpty().withMessage('client.guarantor_names_required').trim(),
 body('guarantor_contact').notEmpty().withMessage('client.guarantor_contact_required').trim(),
 body('guarantor_address').notEmpty().withMessage('client.guarantor_address_required').trim(),
 body('cashier_name').notEmpty().withMessage('client.loan_approved_by_cashier_required').trim(),
 body('installment').notEmpty().withMessage('client.daily_installment_required').trim().bail().
 isFloat({min:0}).withMessage('client.installment_amount_minLength')
 .withMessage('client.daily_installment_Islength')
 .isNumeric().withMessage('client.daily_installment_Isnumeric'),

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