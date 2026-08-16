const {body,validationResult}=require('express-validator')
const {escapeHtmlChar}=require('../HtmlCHars')




const validateInput= [
    body('setting').isObject(),
    body('setting.grace_period').trim().notEmpty().isInt({min:1}),
    body('setting.interest_percentage').trim().notEmpty().isNumeric({min:1}),
     body("setting.overdue").notEmpty().custom(escapeHtmlChar),
     body("setting.payment_frequency").notEmpty().isIn(["Daily", "Weekly", "Monthly"]),
      body("setting.reminder").notEmpty().customSanitizer(escapeHtmlChar),
      body('setting.report_generetion_time').notEmpty().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('setting.officeId').optional({ nullable: true }).isNumeric(),
    body("officecharge").isArray(),
      body("officecharge.*").isObject(),
     body("officecharge.*.start_up").notEmpty()
    .isNumeric(),
    body('officecharge.*.ending').notEmpty().isNumeric(),
     body("officecharge.*.office_interest").notEmpty()
    .isNumeric(),

    (req,res,next)=>{
    
        const errors= validationResult(req);

        if(!errors.isEmpty()){
            let formattedErrors= {}
        errors.array().map(err=>{
            if(!formattedErrors[err.path]){
                formattedErrors[err.path]=err.msg;
            }
        })
        return res.status(400).json({errors:formattedErrors})
        }

        next();

        
    }



]


module.exports=validateInput