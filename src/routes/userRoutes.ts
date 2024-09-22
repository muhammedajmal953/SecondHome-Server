import { Request, Response, Router } from "express";
import UserController from "../controllers/userController";
import UserRepository from "../repositories/userRepository";
import {UserService} from "../services/userServices";
import OtpRepository from "../repositories/otpRepository";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const userService = new UserService(userRepository, otpRepository);
const userController = new UserController(userService);


const userRouter = Router();



userRouter.post('/sign-up', userController.createUser.bind(userController))

userRouter.post('/verify-otp',userController.verifyUser.bind(userController))

userRouter.post('/login', (req: Request, res: Response) => {
    
    const {Email, Password} = req.body
    
    console.log(Email, Password);
    
    res.status(200).json({
        success: true})
})

export default userRouter