import { Router } from "express";
import UserController from "../controllers/userController";
import UserRepository from "../repositories/userRepository";
import {UserService} from "../services/userServices";
import OtpRepository from "../repositories/otpRepository";
import { upload } from "../utils/multer";
import { HostelRepository } from "../repositories/hostelRepository";
import { HostelService } from "../services/hostelService";
import { HostelController } from "../controllers/hostelController";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const userService = new UserService(userRepository, otpRepository);
const userController = new UserController(userService);
const hostelRepository=new HostelRepository()
const hostelService = new HostelService(hostelRepository)
const hostelController=new HostelController(hostelService)





const userRouter = Router();



userRouter.post('/sign-up', userController.createUser.bind(userController))

userRouter.post('/verify-otp',userController.verifyUser.bind(userController))

userRouter.post('/login',userController.loginUser.bind(userController))

userRouter.post('/google-login', userController.singleSignIn.bind(userController))

userRouter.post('/forgot-password', userController.forgotPassword.bind(userController))
userRouter.post('/change-password', userController.changePassword.bind(userController))

userRouter.get('/getUser', userController.getUser.bind(userController))

userRouter.put('/edit-profile', upload.single('avatar'), userController.editProfile.bind(userController))

userRouter.get('/getAllHostel',hostelController.getAllHostel.bind(hostelController))

userRouter.put('/changePassword', userController.newPassword.bind(userController))


 

export default userRouter 