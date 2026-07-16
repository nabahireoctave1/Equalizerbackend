const {body,validationResult}=require('express-validator')
const {escapeHtmlChar}=require('../HtmlCHars')




const validateInput= [
    body('setting').isObject(),
    body('setting.grace_period').trim().notEmpty().withMessage('Grace period required!').isInt({min:1}),
    body('setting.interest_percentage').trim().notEmpty().withMessage('Company profit interest required!').isNumeric({min:1}),
     body("setting.overdue").custom(escapeHtmlChar)
    .notEmpty().withMessage('Overdue message required!'),
     body("setting.payment_frequency").notEmpty().withMessage('Please choose payment frequency!')
    .isIn(["Daily", "Weekly", "Monthly"]),
      body("setting.reminder").customSanitizer(escapeHtmlChar)
    .notEmpty().withMessage('Reminder message required!'),
 body('setting.report_generetion_time')
        .notEmpty()
        .withMessage('Report generation time is required')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Valid Time Format Is HH:mm '),
    body('setting.officeId')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Please choose office'),

    body("officecharge")
    .isArray(),

      body("officecharge.*")
    .isObject(),
    body("officecharge.*.start_up").notEmpty().withMessage('Start up cash required !')
    .isNumeric().withMessage('Cash must be number'),
    body('officecharge.*.ending').notEmpty().withMessage('Ending cash required!').isNumeric().withMessage('Cash must be number !'),
     body("officecharge.*.office_interest").notEmpty().withMessage('Interest ration required !')
    .isNumeric().withMessage('Interest ration must be number'),

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