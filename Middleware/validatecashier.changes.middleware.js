
let {body,validationResult}=require('express-validator');
const {escapeHtmlChar}=require('../HtmlCHars');


const ValidatesCashierChange=[

    body('names').notEmpty().withMessage('Names required !').customSanitizer(escapeHtmlChar),
    body('email').optional({nullable:true}),
    body('phoneno').notEmpty().withMessage('Please enter phone number').bail().isNumeric().withMessage('Phone number must be number')
    .isLength({min:10,max:10}).withMessage('Phone number must be 10 digits'),
    body('location').notEmpty().withMessage('Cashier operating location required !').customSanitizer(escapeHtmlChar),
    body('branch').notEmpty().withMessage('Branch required !'),
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







