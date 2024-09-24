import { Request, Response } from "express";
import { AdminServices } from "../services/adminSevices";


export class AdminController { 

    constructor(private adminService: AdminServices) {
        this.adminService = adminService
    }
    async loginAdmin(req: Request, res: Response) {

        const {data}=req.body
        
        let result = await this.adminService.loginUser(data)
        return res.status(200).json(result)
    }

    async getAllUsers(req: Request, res: Response) {
        const result = await this.adminService.getAllUsers()

        return res.status(200).json(result)
    }

    async blockUser(req: Request, res: Response) {
        const { token } = req.body
        console.log(token);
        
        let result = await this.adminService.blockUser(token)
        return res.status(200).json(result)
    }
    async unBlockUser(req: Request, res: Response) {
        const { token } = req.body
        console.log(token);
        
        let result = await this.adminService.unBlockUser(token)
        return res.status(200).json(result)
    }
}