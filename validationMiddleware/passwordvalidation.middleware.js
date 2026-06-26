

const {body,validationResult}=require('express-validator')



const ValidatePassword= [
    body('password').notEmpty().withMessage('Please enter password!')
    .bail().isLength({min:6,max:8}).withMessage('Password must contain 6 or 8 characters!'),

    body('confirmpassword').notEmpty().withMessage('Please confirm password!').bail()
    .isLength({min:6,max:8}).withMessage('Password must contain 6 or 8 characters!'),

    (req,res,next)=>{
        const errors= validationResult(req)
        if(!errors.isEmpty()){
            let formattederror= {};
         
            errors.array().forEach(err=>{
                if(!formattederror[err.path]){
                    formattederror[err.path]=err.msg
                }
            })

            return res.status(400).json({success:false,errors:formattederror})

        }

        next()
    }
]   



module.exports=ValidatePassword;