
const {body,validationResult}=require('express-validator')
const {escapeHtmlChar} =require('../HtmlCHars')

const validateProfileInformation= [
  body('names').notEmpty().withMessage('adp.validationErrorMessage.name_required').bail().customSanitizer(escapeHtmlChar),
  body('email').optional({nullable:true}),
  body('phone').notEmpty().withMessage('adp.validationErrorMessage.phone_required').bail().isNumeric().withMessage('adp.validationErrorMessage.phone_numerical_only').isLength({min:10,max:10}).withMessage('adp.validationErrorMessage.phone_length_is'),
  body('nid').notEmpty().withMessage('adp.validationErrorMessage.nid_required').bail().isNumeric().withMessage('adp.validationErrorMessage.nid_is_numerical').isLength({min:16,max:16}).withMessage('adp.validationErrorMessage.nid_length_is'),
  (req,res,next)=>{
      const errors=validationResult(req);
      let formattederrors={};

    if(!errors.isEmpty()){
   errors.array().forEach(err=>{
   if(!formattederrors[err.path]){
   formattederrors[err.path]=err.msg;
   }
})

return res.status(400).json({errors:formattederrors});
    }

  next();
  }



]


module.exports=validateProfileInformation;