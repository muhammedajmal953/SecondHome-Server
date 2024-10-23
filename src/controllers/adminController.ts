import { Request, Response } from 'express';
import { AdminServices } from '../services/adminSevices';


export class AdminController {

    constructor(private adminService: AdminServices) {
        this.adminService = adminService;
    }

    async loginAdmin(req: Request, res: Response) {
        try {
            const { data } = req.body;

            if (!data) {
                console.error("Login failed: 'data' is missing");
                return res.status(400).json({ success: false, message: 'Data is required' });
            }

            console.log("Attempting admin login with data:", data);
            const result = await this.adminService.loginUser(data);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error during admin login:", error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const { page, limit } = req.params;
            const newPage = Number(page) || 1;
            const newLimit = Number(limit) || 10;
            const { searchQuery } = req.query
            const name=searchQuery as string
           
            console.log('get all Users search query',searchQuery);

            const result = await this.adminService.getAllUsers(name,newPage, newLimit);

            return res.status(200).json(result);
        } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async getAllVendors(req: Request, res: Response) {
        try {
            const { page, limit } = req.params;
            const newPage = Number(page) || 1;
            const newLimit = Number(limit) || 10;

            const { searchQuery } = req.query
            const name=searchQuery as string
           
            console.log('get all Users search query',searchQuery);
            
           
            const result = await this.adminService.getAllVendors(name,newPage, newLimit);

            return res.status(200).json(result);
        } catch (error) {
            console.error("Error fetching vendors:", error);
            return res.status(404).json({
                success: false,
                message: 'Something went wrong',
                data: null
            });
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            const { token } = req.body;

            if (!token) {
                console.error("Block user failed: 'token' is missing");
                return res.status(400).json({ success: false, message: 'Token is required' });
            }

            console.log("Blocking user with token:", token);
            const result = await this.adminService.blockUser(token);

            return res.status(200).json(result);
        } catch (error) {
            console.error("Error blocking user:", error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async unBlockUser(req: Request, res: Response) {
        try {
            const { token } = req.body;

            if (!token) {
                console.error("Unblock user failed: 'token' is missing");
                return res.status(400).json({ success: false, message: 'Token is required' });
            }

            console.log("Unblocking user with token:", token);
            const result = await this.adminService.unBlockUser(token);

            return res.status(200).json(result);
        } catch (error) {
            console.error("Error unblocking user:", error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async verifyVendor(req: Request, res: Response) {
        const { id } = req.body
            
        try {
            if (!id) {
                return res.status(400).json({ success: false, message: 'Id is required' })
            }
            const result = await this.adminService.verifyVendor(id)
            return res.status(200).json(result)
        } catch (error) {
            console.error('error from verify vendor admin controller',error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.params
            if (!refreshToken) {
                return res.status(401).json({
                    message:'unautherised:no token provided'
                })
            }
            const result = this.adminService.refreshToken(refreshToken)
            return res.status(200).json(result)
            
        } catch (error:unknown) {
            console.error("Error in VendorController.refreshToken:", error);
            if (error instanceof Error) {
           
                if(error.message === 'Token expired' || error.name === 'Token verification failed'){
                    res.status(401).json({ message: 'Unauthorized: Token expired' });
                    return
                }
           }
                res.status(500).json({ error: "Internal server error" });
            
        }
    }
    
}
