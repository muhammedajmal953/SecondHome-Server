import { Request, Response } from "express"
import { VendorService } from "../services/vendorServices"

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
        const {otp, email} = req.body
        const result =await this.vendorService.verifyVendor(otp, email)
        return res.status(200).json(result)
    }

    async singleSignInVendor(req: Request, res: Response) {
       try {
           const { PROVIDER_ID } = req.body;

           console.log('idtoken vendor cntrlr',PROVIDER_ID)
           
        const result = await this.vendorService.singleSignInVendor(PROVIDER_ID)
        return res.status(200).json(result)
       } catch (error) {
        console.error(error)
       }
    }
   async loginVendor(req:Request,res:Response) {
       try {
          console.log('logged in body',req.body);
          let user=req.body
           const result = await this.vendorService.loginVendor(user)
           if (!result?.success) {
           return res.status(200).json(result)
           }
           return res.status(200).json(result)
      } catch (error) {
        console.log(error);
      }  
    }
    }

export default VendorController