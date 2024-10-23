import { Router } from "express";
import UserController from "../controllers/userController";
import UserRepository from "../repositories/userRepository";
import {UserService} from "../services/userServices";
import OtpRepository from "../repositories/otpRepository";
import { upload } from "../utils/multer";
import { HostelRepository } from "../repositories/hostelRepository";
import { HostelService } from "../services/hostelService";
import { HostelController } from "../controllers/hostelController";
import { userAuth } from "../middlewares/userAuthMiddleWare";
import { USER_ROUTES } from "../constants/routes-constants";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const userService = new UserService(userRepository, otpRepository);
const userController = new UserController(userService);
const hostelRepository=new HostelRepository()
const hostelService = new HostelService(hostelRepository)
const hostelController=new HostelController(hostelService)





const userRouter = Router();



userRouter.post(USER_ROUTES.SIGN_UP, userController.createUser.bind(userController))

userRouter.post(USER_ROUTES.VERIFY_OTP,userController.verifyUser.bind(userController))

userRouter.post(USER_ROUTES.LOGIN,userController.loginUser.bind(userController))

userRouter.post(USER_ROUTES.GOOGLE_LOGIN, userController.singleSignIn.bind(userController))

userRouter.post(USER_ROUTES.FORGOT_PASSWORD, userController.forgotPassword.bind(userController))

userRouter.post(USER_ROUTES.CHANGE_PASSWORD, userController.changePassword.bind(userController))

userRouter.get(USER_ROUTES.GET_USER,userAuth, userController.getUser.bind(userController))

userRouter.put(USER_ROUTES.EDIT_PROFILE,userAuth, upload.single('avatar'), userController.editProfile.bind(userController))

userRouter.get(USER_ROUTES.GET_ALL_HOSTEL,userAuth,hostelController.getAllHostel.bind(hostelController))

userRouter.put(USER_ROUTES.CHANGE_PASSWORD_NEW, userAuth, userController.newPassword.bind(userController))

userRouter.get(USER_ROUTES.TOKEN,userController.refreshToken.bind(userController))

userRouter.post(USER_ROUTES.RESEND_OTP, userController.resendOtp.bind(userController))

userRouter.get(USER_ROUTES.GET_HOSTEL,userAuth,hostelController.getHostelWithOwner.bind(hostelController))


export default userRouter    