import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import UserRepository from "../repositories/userRepository";
import { Status } from "../utils/enums";

const userRepository = new UserRepository();
class UserController {
  constructor(private _userService: UserService) {
    this._userService = _userService;
  }

  async createUser(req: Request, res: Response) {
    try {
      const newUser = req.body;
      const result = await this._userService.createUser(newUser);

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

  async verifyUser(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!otp || !email)
        return res
          .status(Status.BAD_REQUEST)
          .json({ message: "Email and OTP required" });

      const registeredUser = await userRepository.findByQuery({ Email: email });

      if (registeredUser && registeredUser.isVerified === true) {
        const result = await this._userService.forgotOtpHandle(email, otp);

        if (result?.success) {
          return res.status(Status.OK).json(result);
        }

        if (
          result?.message === "invalid Otp" ||
          result?.message === "OTP expired"
        ) {
          return res.status(Status.NOT_FOUND).json(result);
        }

        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result?.message || "Verification failed",
        });
      }

      const result = await this._userService.verifyUser(otp, email);

      if (result?.success) {
        return res.status(Status.OK).json(result);
      }

      if (
        result?.message === "invalid Otp" ||
        result?.message === "OTP expired"
      ) {
        return res.status(Status.NOT_FOUND).json(result);
      }

      return res.status(Status.BAD_REQUEST).json({
        success: false,
        message: result?.message || "Verification failed",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async singleSignIn(req: Request, res: Response) {
    try {
      const { PROVIDER_ID, fcmToken } = req.body;
      const result = await this._userService.singleSignIn(
        PROVIDER_ID,
        fcmToken
      );

      if (!result?.success) {
        console.error(result?.message);
        return res.status(Status.BAD_REQUEST).json(result);
      }

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const user = req.body;
      const result = await this._userService.loginUser(user);
      if (!result?.success) {
        return res.status(Status.BAD_REQUEST).json(result);
      }
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.log(error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server error",
        data: null,
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await this._userService.forgotPassword(email.Email);
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const result = await this._userService.changePassword(
        req.body.email,
        req.body.password
      );
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.log(error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      let token = req.headers.authorization!;

      token = token.split(" ")[1];

      const result = await this._userService.getUser(token);
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.log(error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
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

      const result = await this._userService.editProfile(token, data, file!);
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error });
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
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: "Unauthorised: access denined ",
        });
      }

      const result = await this._userService.newPassWord(data, token);
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
      const result = await this._userService.refreshToken(refreshToken);
      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in VendorController.refreshToken:", error);
      if (error instanceof Error) {
        if (
          error.message === "Token expired" ||
          error.name === "Token verification failed"
        ) {
          res
            .status(Status.UN_AUTHORISED)
            .json({ message: "Unauthorized: Token expired" });
          return;
        }
      }
      res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(Status.UN_AUTHORISED)
          .json({ success: false, message: "UnAutherised Approach" });
      }

      const result = this._userService.resendOtp(email);
      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in user resend otp controler:", error);
      if (error instanceof Error) {
        if (error.message === "NO User Found") {
          res
            .status(Status.UN_AUTHORISED)
            .json({ message: "Unauthorized: Email not valid" });
          return;
        }
      }

      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async walletBalance(req: Request, res: Response) {
    try {
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      const result = await this._userService.getUserWallet(token);
      if (!result.success) {
        return res.status(Status.NOT_FOUND).json(result);
      }

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.log(error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ message: "internal server error" });
    }
  }

  async tokenValidate(req: Request, res: Response) {
    try {
      const result = {
        success: true,
        message: 'token valid'
      }

      console.log(result.message);
      
      return res.status(Status.OK).json(result)
    } catch (error) {
      console.log('Error adminController.token validate', error)
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' })
    }
  }
}

export default UserController;
