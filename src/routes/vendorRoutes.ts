import { Router } from 'express';
import VendorController from '../controllers/vendorController';
import { VendorService } from '../services/vendorServices';
import OtpRepository from '../repositories/otpRepository';
import UserRepository from '../repositories/userRepository';
import { upload } from '../utils/multer';
import { HostelRepository } from '../repositories/hostelRepository';
import { HostelService } from '../services/hostelService';
import { HostelController } from '../controllers/hostelController';
import { vendorAuth } from '../middlewares/vendorAuthMiddleWare';

const venderRouter = Router();
const otpRepository = new OtpRepository();
const userRepository = new UserRepository();
const venderService = new VendorService(userRepository,otpRepository);
const vendorController = new VendorController(venderService);
const hostelRepository = new HostelRepository();
const hostelService = new HostelService(hostelRepository);
const hostelController = new HostelController(hostelService);   


venderRouter.post('/sign-up', vendorController.createVendor.bind(vendorController))

venderRouter.post('/verify-otp',vendorController.verifyVendor.bind(vendorController))

venderRouter.post('/login',vendorController.loginVendor.bind(vendorController))

venderRouter.post('/google-login', vendorController.singleSignInVendor.bind(vendorController))

venderRouter.post('/forgot-password', vendorController.forgotPasswordVendor.bind(vendorController))

venderRouter.post('/change-password', vendorController.changePasswordVendor.bind(vendorController))

venderRouter.put('/kycUpload', upload.single('license'), vendorController.kycUpload.bind(vendorController))

venderRouter.get('/vendorDetails',vendorAuth, vendorController.getVendorDetails.bind(vendorController))
  
venderRouter.put('/edit-profile', vendorAuth,upload.single('avatar'), vendorController.editProfile.bind(vendorController))

venderRouter.post('/addHostel',vendorAuth,upload.array('photos',5),hostelController.createHostel.bind(hostelController))

venderRouter.put('/changePassword', vendorAuth, vendorController.newPassword.bind(vendorController))

venderRouter.get('/token', vendorController.refreshToken.bind(vendorController))

venderRouter.post('/resend-otp',vendorController.resendOtp.bind(vendorController))



export default venderRouter