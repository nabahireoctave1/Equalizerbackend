const express=require('express')

const { Company_Registration,Login, PasswordSetting, BillingInfo} = require ('../otherController/controller')
const  companyValidation=require('../Middleware/companyreg.middleware')
const Loginvalidator=require('../Middleware/login.middleware')
const ValidatePassword = require('../Middleware/passwordvalidation.middleware')
const ValidateAgentInfo=require('../Middleware/agent.middleware')
const validateInput= require('../Middleware/companySetting.middleware')
const validatecashierRequest= require('../Middleware/cashier.middleware')
const validateSMSPackageInputs=require('../Middleware/purchaseSMS.validatation.middleware')
const ValidatechangedCompInfo= require('../Middleware/changeComp.info.middleware')
const ValidatesCashierChange=require('../Middleware/validatecashier.changes.middleware')
const upload=require('../Middleware/upload');
const { OverviewDash,Transaction, cashier, CompanyAdmin_info,saveSpadminsetting,
 ReturnCurrentSetting,GetCompanyAdmin,
 HandleReturnAdminList,
 HandlesaveAgent,
 LogAgent,CompanyCurrentSetting,
 HandleSaveCompanySettings,updateofficecharge,
 ReturnCompanyBranch,AddCashier,
 FetchCashier,
 FetchRepaymentInfo,
 FetchCUrrentLoans,
 FetchAllCompanyClient,
 SmsTransactionLog,
 currentSMS,
 PurchaseSMS,
 ChangeCompanyInfo,
 returncompanyCurrentInfo,
 changeCashierInfo,
 DeleteCashier,
 FetchCurrentcashierInformation,
 SuspendCashier,
 ReactivateCashier,
 FetchFlagedBorrowers,
 RejectRequest,
 RequestApproval,
 UpdateProfile,
 FetchProfileInfomation
 } = require('../MainController/Controllers')
const { VerifyToken,VerifyRole } = require('../Middleware/VerifyToken_Role')
const validator = require('../Middleware/settingInputValidator')
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
router.put('/Handle-toggle-on-off-office-setting',VerifyToken,VerifyRole('subadmin'),updateofficecharge)
router.get('/current-branch',VerifyToken,VerifyRole('subadmin'),ReturnCompanyBranch);
router.post('/add-cashier',VerifyToken,VerifyRole('subadmin'),validatecashierRequest,AddCashier)

router.get('/company-cashier',VerifyToken,VerifyRole('subadmin'),FetchCashier)
router.get('/billingInfo',VerifyToken,VerifyRole('subadmin'),BillingInfo)
router.get('/repayment',VerifyToken,VerifyRole('subadmin'),FetchRepaymentInfo)
router.get('/current-loans',VerifyToken,VerifyRole('subadmin'),FetchCUrrentLoans)
router.get('/clients',VerifyToken,VerifyRole('subadmin'),FetchAllCompanyClient)
router.get('/sms-transaction-log',VerifyToken,VerifyRole('subadmin'),SmsTransactionLog)
router.get('/smsinfo',VerifyToken,VerifyRole('subadmin'),currentSMS)
router.post('/purchase-sms',VerifyToken,VerifyRole('subadmin'),validateSMSPackageInputs,PurchaseSMS)
router.put('/change-company-info',VerifyToken,VerifyRole('subadmin'),ValidatechangedCompInfo,ChangeCompanyInfo)
router.get('/Get-comp-information',VerifyToken,VerifyRole('subadmin'),returncompanyCurrentInfo)
router.put('/change-cashier-info',VerifyToken,VerifyRole('subadmin'),ValidatesCashierChange,changeCashierInfo)
router.delete('/delete-cashier/:cashierId',VerifyToken,VerifyRole('subadmin'),DeleteCashier);
router.get('/current-cashier-info/:cashierId',VerifyToken,VerifyRole('subadmin'),FetchCurrentcashierInformation)
router.put('/suspend-cashier/:cashierId',VerifyToken,VerifyRole('subadmin'),SuspendCashier)
router.put('/reactivate-cashier/:cashierId',VerifyToken,VerifyRole('subadmin'),ReactivateCashier)
router.get('/client-flag',VerifyToken,VerifyRole('subadmin'),FetchFlagedBorrowers)
router.put('/reject-req/:client_name',VerifyToken,VerifyRole('subadmin'),RejectRequest)
router.put('/request-approval/:client_name',VerifyToken,VerifyRole('subadmin'),RequestApproval)
router.post('/update-profile',VerifyToken,VerifyRole('subadmin'),upload.single('profile_photo'),UpdateProfile)
router.get('/profile-information',VerifyToken,VerifyRole('subadmin'),FetchProfileInfomation)

module.exports=router