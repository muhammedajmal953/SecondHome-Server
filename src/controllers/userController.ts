import { Request, Response } from "express";
import {UserService} from "../services/userServices";
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

    async singleSignIn(req: Request, res: Response) {
       try {
        const {PROVIDER_ID } = req.body
        const result = await this.userService.singleSignIn(PROVIDER_ID)
        return res.status(200).json(result)
       } catch (error) {
        console.error(error)
       }
    }
   async loginUser(req:Request,res:Response) {
       try {
          console.log('logged in body',req.body);
          let user=req.body
           const result = await this.userService.loginUser(user)
           if (!result?.success) {
           return res.status(400).json(result)
           }
           return res.status(200).json(result)
      } catch (error) {
        console.log(error);
      }  
    }
    }

export default UserController 