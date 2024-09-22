import { Request, Response } from "express";
import {UserService} from "../services/userServices";

const newUser = {}

class UserController {
    constructor(private userService: UserService) {
        this.userService = userService   
    }
    
    async createUser(req: Request, res: Response) {
        const newUser = req.body
        const result = await this.userService.createUser(newUser)

        if (!result.success) {
           return res.status(400).json(result) 
        }
           
        return res.status(200).json(result)
        
    }

    async verifyUser(req: Request, res: Response) {
        const {otp, email} = req.body
        const result =await this.userService.verifyUser(otp, email)
        return res.status(200).json(result)
     }
}

export default UserController 