import { Router } from 'express';
import VendorController from '../controllers/vendorController';
import { VendorService } from '../services/vendorServices';
import OtpRepository from '../repositories/otpRepository';
import UserRepository from '../repositories/userRepository';
import { upload } from '../utils/multer';

const venderRouter = Router();
const otpRepository = new OtpRepository();
const userRepository = new UserRepository();
const venderService = new VendorService(userRepository,otpRepository);
const vendorController = new VendorController(venderService);

venderRouter.post('/sign-up', vendorController.createVendor.bind(vendorController))

venderRouter.post('/verify-otp',vendorController.verifyVendor.bind(vendorController))

venderRouter.post('/login',vendorController.loginVendor.bind(vendorController))

venderRouter.post('/google-login', vendorController.singleSignInVendor.bind(vendorController))

venderRouter.post('/forgot-password', vendorController.forgotPasswordVendor.bind(vendorController))

venderRouter.post('/change-password', vendorController.changePasswordVendor.bind(vendorController))

venderRouter.post('/kycUpload', upload.single('license'),vendorController.kycUpload.bind(vendorController))

export default venderRouter
