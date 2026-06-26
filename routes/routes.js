const express=require('express')

const { Company_Registration,Login, PasswordSetting} = require ('../otherController/controller')
const  companyValidation=require('../validationMiddleware/companyreg.middleware')
const Loginvalidator=require('../validationMiddleware/login.middleware')
const ValidatePassword = require('../validationMiddleware/passwordvalidation.middleware')
const router=express.Router()

router.post('/register-company',companyValidation,Company_Registration)
router.post('/login',Loginvalidator,Login)
router.post('/Password-setting',ValidatePassword,PasswordSetting)


module.exports=router