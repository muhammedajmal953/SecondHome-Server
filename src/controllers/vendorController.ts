import { Request, Response } from "express"
import { VendorService } from "../services/vendorServices"
import UserRepository from "../repositories/userRepository";

const userRepository = new UserRepository();
class VendorController {
    constructor(private vendorService: VendorService) {
        this.vendorService = vendorService
    }
    
    async createVendor(req: Request, res: Response) {
        const newUser = req.body
        const result = await this.vendorService.createVendor(newUser)

        if (!result.success) {
            return res.status(400).json(result)
        }
           
        return res.status(200).json(result)
        
    }

    async verifyVendor(req: Request, res: Response) {
        const { otp, email } = req.body
        const registeredUser = await userRepository.getUserByEmail(email);
       

        console.log('otp and email', otp, email);
        
      if (registeredUser&&registeredUser.isVerified===true) {
          const result= await this.vendorService.forgotOtpHandler(email,otp);
          return res.status(200).json(result);
      }
        const result = await this.vendorService.verifyVendor(otp, email)
        return res.status(200).json(result)
    }

    async singleSignInVendor(req: Request, res: Response) {
        try {
            const { PROVIDER_ID } = req.body;

            console.log('idtoken vendor cntrlr', PROVIDER_ID)
           
            const result = await this.vendorService.singleSignInVendor(PROVIDER_ID)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error)
        }
    }
    async loginVendor(req: Request, res: Response) {
        try {
            console.log('logged in body', req.body);
            let user = req.body
            const result = await this.vendorService.loginVendor(user)
            if (!result?.success) {
                return res.status(200).json(result)
            }
            return res.status(200).json(result)
        } catch (error) {
            console.log(error);
        }
    }

    async forgotPasswordVendor(req: Request, res: Response) {
        try {
            const { email } = req.body
            console.log(email,'dfdfdf');
            
            const result = await this.vendorService.forgotPassword(email.Email)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: error })
        }
    }

    async changePasswordVendor(req: Request, res: Response) { 
        try {
            let result =await this.vendorService.changePasswordVendor(req.body.email, req.body.password)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error })
           
        }
    }

    async kycUpload(req: Request, res: Response) { 
        try {
            console.log(req.body,'servise that builed for kyc upload');
            console.log(req.file,'servise that builed for kyc upload');
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'File not found' })
             }
            
            let result =await this.vendorService.kycUpload(req.body.email,req.file)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error })
        }
    }

    async getVendorDetails(req: Request, res: Response) { 
        try {
            console.log("token get vendor token", req.headers.authorization!);
            let bearer = req.headers.authorization!
            let token=bearer.split(' ')[1]
            
            console.log("token get vendor token", token);
 
            if (!token) {
                console.log("token not found");
                
                return res.status(400).json({ success: false, message: 'Token not found' })
            }
            
            const result = await this.vendorService.getVendorDtails(token)
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ success: false, message: error })
        }
    }

    
  
}

export default VendorController 