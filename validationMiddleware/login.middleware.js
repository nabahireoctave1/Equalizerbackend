
const {body,validationResult}=require('express-validator')

const LoginValidators= [
    body('phone').trim().notEmpty()
    .withMessage('Phone number required!').
    bail().isNumeric()
    .withMessage("Phone number must be number only!")
    .isLength({min:10,max:10}).withMessage('Phone number must contain 10 digits!'),
    body('password').trim().notEmpty()
    .withMessage('Password field must not be empty!')
    .bail().isLength({min:6,max:8}).withMessage('Password must contain bettween 6 or 8 characters'),
    (req,res,next)=>{
        const errors= validationResult(req)

        if(!errors.isEmpty()){
            let formatted={};

            errors.array().forEach(err=>{
                
                if(!formatted[err.path]){
                  formatted[err.path] = err.msg;
                }
            })
                
         return res.status(400).json({success:false,errors:formatted})
           

        }
            next()
    }



]


module.exports=LoginValidators;