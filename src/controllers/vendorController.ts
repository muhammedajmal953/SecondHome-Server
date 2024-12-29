import { Request, Response } from "express";
import { VendorService } from "../services/vendorServices";
import UserRepository from "../repositories/userRepository";
import { Status } from "../utils/enums";

const userRepository = new UserRepository();
class VendorController {
  constructor(private _vendorService: VendorService) {
    this._vendorService = _vendorService;
  }

  async createVendor(req: Request, res: Response) {
    try {
      const newUser = req.body;

      console.dir('fcm token from vendorToken from the vendor controller',newUser.fcmToken) 

      const result = await this._vendorService.createVendor(newUser);

      if (!result.success) {
        return res.status(Status.CONFLICT).json(result);
      }

      return res.status(Status.CREATED).json(result);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async verifyVendor(req: Request, res: Response) {
    const { otp, email } = req.body;
    const registeredUser = await userRepository.findByQuery({ Email: email });

    if (registeredUser && registeredUser.isVerified === true) {
      const result = await this._vendorService.forgotOtpHandler(email, otp);
      
      if (result?.success) {
        return res.status(Status.OK).json(result);
      }
    
      if (result?.message === 'invalid Otp' || result?.message === 'OTP expired') {
        return res.status(Status.NOT_FOUND).json(result)
      }

      return res.status(Status.BAD_REQUEST).json({
        success: false,
        message: result?.message || "Verification failed",
      });

    }
    const result = await this._vendorService.verifyVendor(otp, email);
    
    if (result?.success) {
        return res.status(Status.OK).json(result);
      }
    
      if (result?.message === 'invalid Otp' || result?.message === 'OTP expired') {
        return res.status(Status.NOT_FOUND).json(result)
      }

      return res.status(Status.BAD_REQUEST).json({
        success: false,
        message: result?.message || "Verification failed",
      });

  }

  async singleSignInVendor(req: Request, res: Response) {
    try {
      const { PROVIDER_ID,fcmToken } = req.body;

      const result = await this._vendorService.singleSignInVendor(PROVIDER_ID,fcmToken);
      return res.status(Status.OK).json(result);
    } catch (error) {
        console.error("Error single singn in:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  async loginVendor(req: Request, res: Response) {
    try {
      const user = req.body;
      const result = await this._vendorService.loginVendor(user);
      if (!result?.success) {
        return res.status(Status.NOT_FOUND).json(result);
      }
      return res.status(Status.OK).json(result);
    } catch (error) {
        console.error("Error Login Vendor:", error);
        return res.status(Status.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Internal Server Error",
        });
    }
  }

  async forgotPasswordVendor(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await this._vendorService.forgotPassword(email.Email);
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server error' });
    }
  }

  async changePasswordVendor(req: Request, res: Response) {
    try {
      const result = await this._vendorService.changePasswordVendor(
        req.body.email,
        req.body.password
      );
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
        return res.status(Status.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal sever error' });
    }
  }

  async kycUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res
          .status(Status.BAD_REQUEST)
          .json({ success: false, message: "File not found" });
      }

      const result = await this._vendorService.kycUpload(
        req.body.email,
        req.file
      );
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
  }

  async getVendorDetails(req: Request, res: Response) {
    try {
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      if (!token) {
        
        return res
          .status(Status.UN_AUTHORISED)
          .json({ success: false, message: "Token not found" });
      }

      const result = await this._vendorService.getVendorDtails(token);
      return res.status(200).json(result);
    } catch (error) {
        console.error('error in get vendor details',error)
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ success: false, message: 'internal Server error' });
    }
  }

  async editProfile(req: Request, res: Response) {
    try {
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      const data = req.body;

      let file: Express.Multer.File;
      if (req.file) {
        file = req.file;
      }

      if (!token) {
    
        return res
          .status(Status.UN_AUTHORISED)
          .json({ success: false, message: "Token not found" });
      }

      const result = await this._vendorService.editProfile(token, data, file!);
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ success: false, message: error });
    }
  }

  async newPassword(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: "no data found",
          data: null,
        });
      }
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      if (!token) {
      
        return res
          .status(Status.UN_AUTHORISED)
          .json({ success: false, message: "Token not found" });
      }
      const result = await this._vendorService.newPassWord(data, token);
      res.status(Status.OK).json(result);
    } catch (error) {
      console.log(error);
      res.json(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.params;
      if (!refreshToken) {
        return res.status(Status.UN_AUTHORISED).json({
          message: "unautherised:no token provided",
        });
      }
      const result = await this._vendorService.refreshToken(refreshToken);
      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in VendorController.refreshToken:", error);
      if (error instanceof Error) {
        if (
          error.message === "Token expired" ||
          error.name === "Token verification failed"
        ) {
          res.status(Status.UN_AUTHORISED).json({ message: "Unauthorized: Token expired" });
          return;
        }
      }
      res.status(Status.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(Status.BAD_REQUEST)
          .json({ success: false, message: "UnAutherised Approach" });
      }

      const result = this._vendorService.resendOtp(email);
      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in user resend otp controler:", error);
      if (error instanceof Error) {
        if (error.message === "NO User Found") {
            res.status(Status.BAD_REQUEST).json({ message: "Unauthorized: Email not valid" });
          return;
        }
      }

        return res
            .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getmyHostels(req: Request, res: Response) {
    try {
      const { page } = req.params;
      const { searchQuery } = req.query;
      const bearer = req.headers.authorization!;
        const token = bearer.split(" ")[1];
        

        if (!token) {
          
            return res
              .status(Status.UN_AUTHORISED)
              .json({ success: false, message: "Token not found" });
          }

      const result = await this._vendorService.getAllHostels(
        Number(page),
        searchQuery as string,
        token
      );
      return res.status(Status.OK).json(result);
    } catch (error) {
        console.log(error);
        return res
            .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

 async getAllBookings(req: Request, res: Response) {
    try {
      const { page } = req.params;
      // const { searchQuery } = req.query;
      const bearer = req.headers.authorization!;
        const token = bearer.split(" ")[1];
        

        if (!token) {
    
            return res
              .status(Status.UN_AUTHORISED)
              .json({ success: false, message: "Token not found" });
      }
      
      const result = await this._vendorService.getAllBookings(page, token)
      
      res.status(Status.OK).json(result)
    } catch (error) {
      console.error('Error from the getbooking vendor controller:-', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ message: 'internal sever error' })
    }
  }

 async conformCancel(req: Request, res: Response) {
    try {
      const bookingId = req.query.id
      if (!bookingId) {
        return res.status(Status.BAD_REQUEST).json({message:'Bad request'})
      }

      const result=await this._vendorService.confirmCancel(bookingId as string)
      
      if (result) {
        return res.status(Status.OK).json(result)
      }
    } catch (error) {
      console.error('Error from Vendor controller cancel confirm',error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({message:'Internal Server Error'})
    }
  }
  async walletBalance(req: Request, res: Response) {
    try {
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      const result = await this._vendorService.getUserWallet(token)
      if (!result.success) {
        return res.status(Status.NOT_FOUND).json(result)
      }
      
      return res.status(Status.OK).json(result)
    } catch (error) {
      console.log(error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({message:'internal server error'})
      
    }
  }

  async tokenValidate(req: Request, res: Response) {
    try {
      const result = {
        success: true,
        message: 'token valid'
      }
      return res.status(Status.OK).json(result)
    } catch (error) {
      console.log('Error adminController.token validate', error)
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' })
    }
  }
}

export default VendorController;
