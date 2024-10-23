import { NextFunction, Router,Request,Response } from 'express';
import VendorController from '../controllers/vendorController';
import { VendorService } from '../services/vendorServices';
import OtpRepository from '../repositories/otpRepository';
import UserRepository from '../repositories/userRepository';
import { upload } from '../utils/multer';
import { HostelRepository } from '../repositories/hostelRepository';
import { HostelService } from '../services/hostelService';
import { HostelController } from '../controllers/hostelController';
import { vendorAuth } from '../middlewares/vendorAuthMiddleWare';
import { VENDER_ROUTES } from '../constants/routes-constants';
import { handleValidationErrors, validateHostel } from '../utils/vadidations';

const venderRouter = Router();
const otpRepository = new OtpRepository();
const userRepository = new UserRepository();
const hostelRepository = new HostelRepository();

const venderService = new VendorService(userRepository,otpRepository,hostelRepository);
const vendorController = new VendorController(venderService);
const hostelService = new HostelService(hostelRepository);
const hostelController = new HostelController(hostelService);   


venderRouter.post(VENDER_ROUTES.SIGN_UP, vendorController.createVendor.bind(vendorController))

venderRouter.post(VENDER_ROUTES.VERIFY_OTP,vendorController.verifyVendor.bind(vendorController))

venderRouter.post(VENDER_ROUTES.LOGIN,vendorController.loginVendor.bind(vendorController))

venderRouter.post(VENDER_ROUTES.GOOGLE_LOGIN, vendorController.singleSignInVendor.bind(vendorController))

venderRouter.post(VENDER_ROUTES.FORGOT_PASSWORD, vendorController.forgotPasswordVendor.bind(vendorController));

venderRouter.post(VENDER_ROUTES.CHANGE_PASSWORD, vendorController.changePasswordVendor.bind(vendorController));

venderRouter.put(VENDER_ROUTES.KYC_UPLOAD, upload.single('license'), vendorController.kycUpload.bind(vendorController));

venderRouter.get(VENDER_ROUTES.VENDOR_DETAILS, vendorAuth, vendorController.getVendorDetails.bind(vendorController));
  
venderRouter.put(VENDER_ROUTES.EDIT_PROFILE, vendorAuth, upload.single('avatar'), vendorController.editProfile.bind(vendorController));

venderRouter.post(VENDER_ROUTES.ADD_HOSTEL, vendorAuth, upload.array('photos', 5), hostelController.createHostel.bind(hostelController));

venderRouter.put(VENDER_ROUTES.CHANGE_PASSWORD_NEW, vendorAuth, vendorController.newPassword.bind(vendorController));
 
venderRouter.get(VENDER_ROUTES.TOKEN, vendorController.refreshToken.bind(vendorController));    

venderRouter.post(VENDER_ROUTES.RESEND_OTP, vendorController.resendOtp.bind(vendorController));

venderRouter.get(VENDER_ROUTES.GET_HOSTELS, vendorAuth, vendorController.getmyHostels.bind(vendorController))

venderRouter.get(VENDER_ROUTES.GET_HOSTEL, vendorAuth, hostelController.getHostel.bind(hostelController))

venderRouter.put(VENDER_ROUTES.EDIT_HOSTEL,upload.array('photos', 5),  (req:Request, res:Response, next:NextFunction) => {
    console.log('Body:', req.body); // Log the body to ensure multer is working correctly
    console.log('Files:', req.files); // Log the files to ensure multer is handling file uploads
    next();
  },vendorAuth,validateHostel,handleValidationErrors,hostelController.editHostel.bind(hostelController))
 
export default venderRouter;