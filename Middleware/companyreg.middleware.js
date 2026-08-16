const { body, validationResult } = require("express-validator");

const {escapeHtmlChar}=require('../HtmlCHars')



const companyValidation = [

  body("companyNames")
    .trim()
    .notEmpty().customSanitizer(escapeHtmlChar)
    .withMessage("Company name required!")
    .bail()
    .isLength({ min: 2,max: 100})
    .withMessage("Company name must be 2-100 chars!")
,

  body("adminNames")
    .trim()
    .notEmpty()
    .withMessage("Admin name required!")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Admin name too short!")
    .customSanitizer(escapeHtmlChar),

  body("adminPhone")
    .trim()
    .notEmpty()
    .withMessage("Phone number required!")
    .bail()
    .isMobilePhone()
    .withMessage("Invalid phone!"),

  body("adminNid")
    .trim()
    .notEmpty()
    .withMessage("National identity required!")
    .bail()
    .isLength({ min: 16, max: 16 })
    .withMessage("National identity must be 16 digits!")
    .isNumeric().withMessage("Identity must be number!"),

  body("companyLocation")
    .trim()
    .notEmpty()
    .withMessage("Location required!")
    .customSanitizer(escapeHtmlChar),

  body("adminEmail")
    .trim()
    .optional({nullable:true})
    .bail()
    .isEmail()
    .withMessage("Invalid email format!"),

  body("permissionId")
    .optional({nullable:true})  
      .bail()
    .isNumeric()
    .withMessage("Permission must be number!"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      const formatted = {};

      errors.array().forEach(err => {
        if (!formatted[err.path]) {
          formatted[err.path] = err.msg;
        }
      });

      return res.status(400).json({
        success:false,
        errors: formatted
      });
    }

    next();
  }
];

module.exports = companyValidation;