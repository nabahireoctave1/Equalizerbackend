const express=require('express')

const { Company_Registration,Login, PasswordSetting} = require ('../otherController/controller')
const  companyValidation=require('../validationMiddleware/companyreg.middleware')
const Loginvalidator=require('../validationMiddleware/login.middleware')
const ValidatePassword = require('../validationMiddleware/passwordvalidation.middleware')
const ValidateAgentInfo=require('../validationMiddleware/agent.middleware')
const validateInput= require('../validationMiddleware/companySetting.middleware')
const { OverviewDash,Transaction, cashier, CompanyAdmin_info,saveSpadminsetting,
 ReturnCurrentSetting,GetCompanyAdmin,
 HandleReturnAdminList,
 HandlesaveAgent,
 LogAgent,CompanyCurrentSetting,
 HandleSaveCompanySettings
 } = require('../MainController/Controllers')
const { VerifyToken,VerifyRole } = require('../validationMiddleware/VerifyToken_Role')
const validator = require('../validationMiddleware/settingInputValidator')
const router=express.Router()

router.post('/register-company',companyValidation,Company_Registration)
router.post('/login',Loginvalidator,Login)
router.post('/Password-setting',ValidatePassword,PasswordSetting)
router.get('/dash-overview',VerifyToken,OverviewDash)
router.get('/transaction',VerifyToken,VerifyRole('superadmin'), Transaction)
router.get('/cashier',VerifyToken,VerifyRole('superadmin'),cashier)
router.get('/user-info',VerifyToken,VerifyRole('superadmin'),CompanyAdmin_info)
router.post('/save-setting',VerifyToken,VerifyRole('superadmin'),validator,saveSpadminsetting)
router.get('/current-setting',VerifyToken,VerifyRole('superadmin'),ReturnCurrentSetting);
router.get('/company-admin',VerifyToken,VerifyRole('superadmin'),GetCompanyAdmin);
router.get('/admin-list',VerifyToken,VerifyRole('superadmin'),HandleReturnAdminList);
router.post('/add-agent-data',VerifyToken,VerifyRole('superadmin'),ValidateAgentInfo,HandlesaveAgent)
router.get('/agent-info',VerifyToken,VerifyRole('superadmin'),LogAgent);
router.get('/company-current-setting',VerifyToken,VerifyRole('subadmin'),CompanyCurrentSetting)
router.post('/save-company-settings',VerifyToken,VerifyRole('subadmin'),validateInput,HandleSaveCompanySettings)



module.exports=router