
const {body,validationResult}=require('express-validator');

const ValidateBorrowerInfo= [
    body('name').notEmpty().withMessage('client.client_name_required').trim(),
    body('ninid').notEmpty().withMessage('client.Id_required').trim().bail()
    .isNumeric().withMessage('client.client.Id_isnumeric').isLength({min:16,max:16})
    .withMessage('client.Id_length'),
    body('phone').notEmpty().withMessage('client.contact_required').trim().bail().
    isNumeric().withMessage('client.contact_isnumeric').isLength({min:10,max:10})
    .withMessage('client.contact_length'),
   body('client_address').notEmpty().withMessage('client.client_address_required').trim(),
  body('client_B_type').notEmpty().withMessage('client.bussiness_type_required').trim(),
  body('client_B_location').notEmpty().withMessage('client.bussiness_location_required').trim(),
   body('client_B_Name').notEmpty().withMessage('client.bussiness_name_required').trim(),

   (req,res,next)=>{
    
    const error= validationResult(req);
    if(!error.isEmpty()){
        let formattederror={};

 error.array().forEach((err)=>{
    if(!formattederror[err.path]){
    formattederror[err.path]=err.msg;
    }
    

 })
    return res.status(400).json({error:formattederror});
    

    }

    next()

  



   }
    
]



module.exports=ValidateBorrowerInfo;