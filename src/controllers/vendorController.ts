import {Request,Response } from "express"
import { VendorService } from "../services/vendorServices"
import UserRepository from "../repositories/userRepository";

const userRepository = new UserRepository();
class VendorController {
    constructor(private _vendorService: VendorService) {
        this._vendorService = _vendorService
    }
    
    async createVendor(req: Request, res: Response) {
        const newUser = req.body
        const result = await this._vendorService.createVendor(newUser)

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
          const result= await this._vendorService.forgotOtpHandler(email,otp);
          return res.status(200).json(result);
      }
        const result = await this._vendorService.verifyVendor(otp, email)
        return res.status(200).json(result)
    }

    async singleSignInVendor(req: Request, res: Response) {
        try {
            const { PROVIDER_ID } = req.body;

            console.log('idtoken vendor cntrlr', PROVIDER_ID)
           
            const result = await this._vendorService.singleSignInVendor(PROVIDER_ID)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error)
        }
    }
    async loginVendor(req: Request, res: Response) {
        try {
            console.log('logged in body', req.body);
            const user = req.body
            const result = await this._vendorService.loginVendor(user)
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
            
            const result = await this._vendorService.forgotPassword(email.Email)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: error })
        }
    }

    async changePasswordVendor(req: Request, res: Response) { 
        try {
            const result =await this._vendorService.changePasswordVendor(req.body.email, req.body.password)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error })
           
        }
    }

    async kycUpload(req: Request, res: Response) { 
        try {
          
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'File not found' })
             }
            
            const result =await this._vendorService.kycUpload(req.body.email,req.file)
            return res.status(200).json(result)
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error })
        }
    }

    async getVendorDetails(req: Request, res: Response) { 
        try {
            const bearer = req.headers.authorization!
            const token=bearer.split(' ')[1]
        
            if (!token) {
                console.log("token not found");
                
                return res.status(400).json({ success: false, message: 'Token not found' })
            }
            
            const result = await this._vendorService.getVendorDtails(token)
            return res.status(200).json(result)
        } catch (error) {
            return res.status(500).json({ success: false, message: error })
        }
    }

    async editProfile(req: Request, res: Response) {
        try {
        
            const bearer = req.headers.authorization!
            const token=bearer.split(' ')[1]
            
            
            const data = req.body

            let file: Express.Multer.File 
            if(req.file){
                file=req.file
            }
 
            if (!token) {
                console.log("token not found");
                
                return res.status(400).json({ success: false, message: 'Token not found' })
            }

            const result =await this._vendorService.editProfile(token,data,file!)  
            return res.status(200).json(result)
        } catch (error) { 
            console.error(error);
            return res.status(500).json({ success: false, message: error })
        }  
    } 

    
    async newPassword(req:Request,res:Response) {
        try {
          const data = req.body
          if (!data) {
            return res.status(400).json({
              success: false,
              message: 'no data found',
              data:null
            })
          }
            const bearer = req.headers.authorization!;
            const token = bearer.split(" ")[1];
    
            const result = await this._vendorService.newPassWord(data, token)
            res.status(200).json(result)
          
          
        } catch (error) {
          console.log(error);
          res.json(500).json({
            success: false,
            message:'Internal Server Error'
          })
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
            const result =await this._vendorService.refreshToken(refreshToken)
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

    async resendOtp(req: Request, res: Response) {
        try {
          const { email } = req.body
            console.log(email);
            
            console.log('vendor resend otp controller reched' ,email);
            
          
          if (!email) {
            return res.status(401).json({ success: false,message:'UnAutherised Approach'})
          }
    
          
          
         const result=this._vendorService.resendOtp(email)
          return res.status(200).json(result)
        } catch (error: unknown) {
            console.error("Error in user resend otp controler:", error);
            if (error instanceof Error) {
                if (error.message === 'NO User Found') {
                  res.status(401).json({ message: 'Unauthorized: Email not valid' });
                  return
                }
            }
         
          return  res.status(500).json({success:false,message:'Internal Server Error'})
        }
    }
    
   async getmyHostels(req:Request,res:Response) {
       try {
           const { page } = req.params
           const { searchQuery } = req.query
           const bearer = req.headers.authorization!
           const token=bearer.split(' ')[1]
           
           const result = await this._vendorService.getAllHostels(Number(page), searchQuery as string, token)
           return res.status(200).json(result)

       } catch (error) {
        console.log(error);
       }
   }
} 

export default VendorController 