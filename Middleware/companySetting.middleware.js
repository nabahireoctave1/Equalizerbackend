const {body,validationResult}=require('express-validator')
const {escapeHtmlChar}=require('../HtmlCHars')




const validateInput= [
    body('setting').isObject(),
    body('setting.grace_period').trim().notEmpty().isInt({min:1}),
    body('setting.interest_percentage').trim().notEmpty().isNumeric().isLength({min:0}),
     body("setting.overdue").notEmpty().customSanitizer(escapeHtmlChar),
     body("setting.payment_frequency").notEmpty().isIn(["Daily", "Weekly", "Monthly"]),
      body("setting.reminder").notEmpty().customSanitizer(escapeHtmlChar),
      body('setting.report_generetion_time').notEmpty().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('setting.officeId').optional({ nullable: true }).isNumeric().isLength({min:0}),
    body("officecharge").isArray(),
      body("officecharge.*").isObject(),
     body("officecharge.*.start_up").notEmpty().isNumeric().isLength({min:0}),
    body('officecharge.*.ending').notEmpty().isNumeric().isLength({min:0}),
     body("officecharge.*.office_interest").notEmpty().isNumeric().isLength({min:0})
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