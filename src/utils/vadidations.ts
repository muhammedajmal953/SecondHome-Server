import { Response,Request,NextFunction } from 'express';
import { body, validationResult } from 'express-validator'

interface Rate {
  quantity: number; // Ensure quantity is a number
  price: number;    // Ensure price is a number
}

export const validateHostel = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
      .withMessage('Name must contain only letters and spaces'),
  
    body('phone')
      .trim()
      .matches(/^[5-9][0-9]{9}$/)
      .withMessage('Invalid phone number format'),
  
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
  
    body('facilities')
      .isArray()
      .withMessage('Facilities must be an array')
      .notEmpty()
      .withMessage('At least one facility is required'),
  
    body('nearbyPlaces')
      .isArray()
      .withMessage('Nearby places must be an array')
      .notEmpty()
      .withMessage('At least one nearby place is required'),
  
    body('policies')
      .trim()
      .notEmpty()
      .withMessage('Policies are required')
      .matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/)
      .withMessage('Policies must contain only letters and spaces'),
  
    body('category')
      .trim()
      .isIn(['MEN', 'WOMEN', 'MIXED'])
      .withMessage('Invalid category'),
  
    body('advance')
      .trim()
      .matches(/^[1-9][0-9]*$/)
      .withMessage('Advance must be a positive number'),
  
    body('foodRate')
      .trim()
      .matches(/^[1-9][0-9]*$/)
      .withMessage('Food rate must be a positive number'),
  
    body('rates')
      .isObject()
      .withMessage('Rates must be an object')
        .custom((value) => {
          value.forEach((rate:Rate) => {
            // Check for quantity property
            if (!rate.quantity || !Number.isInteger(rate.quantity) || rate.quantity <= 0) {
              throw new Error('Each rate must have a valid quantity property (positive integer)');
            }
            // Check for price property
            if (!rate.price || typeof rate.price !== 'number' || rate.price <= 0) {
              throw new Error('Each rate must have a valid price property (positive number)');
            }
          });
        return true;
      })
];

 export const handleValidationErrors = (req:Request, res:Response, next:NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
};
  
export const isValidPassword=(password: string)=>{
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

  return passwordRegex.test(password)
}
export const isValidEmail=(email: string)=>{
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email)
}
export const isValidPhone = (phone: number) => {
  const newNumber:string=phone.toString()
  const phoneRegex = /^[5-9][0-9]{9}$/;

  return phoneRegex.test(newNumber)
}


