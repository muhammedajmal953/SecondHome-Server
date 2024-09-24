import { Router } from 'express';
import VendorController from '../controllers/vendorController';
import { VendorService } from '../services/vendorServices';
import OtpRepository from '../repositories/otpRepository';
import UserRepository from '../repositories/userRepository';

const venderRouter = Router();
const otpRepository = new OtpRepository();
const userRepository = new UserRepository();
const venderService = new VendorService(userRepository,otpRepository);
const vendorController = new VendorController(venderService);

venderRouter.post('/sign-up', vendorController.createVendor.bind(vendorController))

venderRouter.post('/verify-otp',vendorController.verifyVendor.bind(vendorController))

venderRouter.post('/login',vendorController.loginVendor.bind(vendorController))

venderRouter.post('/google-login', vendorController.singleSignInVendor.bind(vendorController))


export default venderRouter
