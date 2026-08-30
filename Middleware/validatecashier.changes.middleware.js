
let {body,validationResult}=require('express-validator');
const {escapeHtmlChar}=require('../HtmlCHars');


const ValidatesCashierChange=[

    body('names').notEmpty().withMessage('nc.validationMessage.names_require').customSanitizer(escapeHtmlChar),
    body('email').optional({nullable:true}),
    body('phoneno').notEmpty().withMessage('nc.validationMessage.phone_number_required').bail().isNumeric().
    withMessage('nc.validationMessage.phone_is_numeric')
    .isLength({min:10,max:10}).withMessage('nc.validationMessage.phone_length'),
    body('location').notEmpty().withMessage('nc.validationMessage.location_required').customSanitizer(escapeHtmlChar),
    body('branch').notEmpty().withMessage('nc.validationMessage.branch_required'),
    (req,res,next)=>{
        const errors= validationResult(req);
      
        if(!errors.isEmpty()){
            let formattedErrors= {};
          errors.array().map(err=>{ 
            if(!formattedErrors[err.path]){
                formattedErrors[err.path]=err.msg
            }
          })

          return res.status(400).json({Errors:formattedErrors});


        }

        next();

    }


]

module.exports=ValidatesCashierChange;







