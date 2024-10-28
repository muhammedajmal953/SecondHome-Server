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
import { WishlistRepository } from "../repositories/wishlistRepository";
import { WishlistServices } from "../services/wishlistServises";
import { WishlistController } from "../controllers/wishlistController";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const wishlistRepository = new WishlistRepository();
const hostelRepository = new HostelRepository()

const userService = new UserService(userRepository, otpRepository);
const userController = new UserController(userService);

const hostelService = new HostelService(hostelRepository)
const hostelController = new HostelController(hostelService)

//wish list service and controller
const wishlistServices = new WishlistServices(wishlistRepository, hostelRepository)
const wishlistController=new WishlistController(wishlistServices)





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

userRouter.get(USER_ROUTES.GET_HOSTEL, userAuth, hostelController.getHostelWithOwner.bind(hostelController))

//wishlistRoutes
userRouter.post(USER_ROUTES.ADD_TO_WISHLIST,userAuth,wishlistController.addToWishlist.bind(wishlistController))
userRouter.get(USER_ROUTES.GET_ALL_WISHLIST,userAuth,wishlistController.getAllWishlist.bind(wishlistController))
userRouter.put(USER_ROUTES.REMOVE_FROM_WISHLIST,userAuth,wishlistController.removeWishlist.bind(wishlistController))



export default userRouter    