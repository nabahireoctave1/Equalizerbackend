const { body, validationResult } = require('express-validator');
const {escapeHtmlChar}=require('../HtmlCHars')


const validator = [
    body('reminder')
        .trim()
        .customSanitizer(escapeHtmlChar)
        .notEmpty()
        .withMessage('Reminder message  required!'),

    body('overdue')
        .trim()
        .customSanitizer(escapeHtmlChar)
        .notEmpty()
        .withMessage('Overdue message  required!'),

    body('interest')
        .trim()
        .customSanitizer(escapeHtmlChar)
        .notEmpty()
        .withMessage('Interest ratio required!')
        .bail()
        .isNumeric()
        .withMessage('Interest must be a number!'),

    body('lockafter')
        .trim()
        .customSanitizer(escapeHtmlChar)
        .notEmpty()
        .withMessage('Lock after  required!')
        .bail()
        .isNumeric()
        .withMessage('Lock after must be a number!'),

    body('graceperiod')
        .trim()
        .customSanitizer(escapeHtmlChar)
        .notEmpty()
        .withMessage('Grace period  required!')
        .bail()
        .isNumeric()
        .withMessage('Grace period must be a number!'),

    body('agentreward')
        .trim()
        .customSanitizer(escapeHtmlChar)
        .notEmpty()
        .withMessage('Agent reward required!')
        .bail()
        .isNumeric()
        .withMessage('Agent reward must be a number!'),

    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            let formated={};
    
            errors.array().map((err)=>{
                if(!formated[err.path]){
                    formated[err.path]=err.msg
                }
            })
            
            return res.status(400).json({errors:formated})
           
        }
        next();


    }
];

module.exports = validator;