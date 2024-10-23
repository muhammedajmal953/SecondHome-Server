import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import UserRepository from "../repositories/userRepository";

const userRepository = new UserRepository();
class UserController {
  constructor(private userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response) {
    const newUser = req.body;
    const result = await this.userService.createUser(newUser);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  }

  async verifyUser(req: Request, res: Response) {
    const { otp, email } = req.body;
    const registeredUser = await userRepository.getUserByEmail(email);

    if (registeredUser && registeredUser.isVerified === true) {
      const result = await this.userService.forgotOtpHandle(email, otp);
      return res.status(200).json(result);
    }
    const result = await this.userService.verifyUser(otp, email);
    return res.status(200).json(result);
  }

  async singleSignIn(req: Request, res: Response) {
    try {
      const { PROVIDER_ID } = req.body;
      const result = await this.userService.singleSignIn(PROVIDER_ID);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
    }
  }
  async loginUser(req: Request, res: Response) {
    try {
      console.log("logged in body", req.body);
      const user = req.body;
      const result = await this.userService.loginUser(user);
      if (!result?.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: error,
        data: null,
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      console.log("email forgot", email);

      const result = await this.userService.forgotPassword(email.Email);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const result = await this.userService.changePassword(
        req.body.email,
        req.body.password
      );
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      let token = req.headers.authorization!;

      token = token.split(" ")[1];

      const result = await this.userService.getUser(token);
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async editProfile(req: Request, res: Response) {
    try {
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      const data = req.body;

      console.log("asdfasdf", req.body);

      let file: Express.Multer.File;
      if (req.file) {
        file = req.file;
      }

      if (!token) {
        console.log("token not found");

        return res
          .status(400)
          .json({ success: false, message: "Token not found" });
      }

      const result = await this.userService.editProfile(token, data, file!);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error });
    }
  }

  async newPassword(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data) {
        return res.status(400).json({
          success: false,
          message: "no data found",
          data: null,
        });
      }
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];

      const result = await this.userService.newPassWord(data, token);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.json(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.params;
      if (!refreshToken) {
        return res.status(401).json({
          message: "unautherised:no token provided",
        });
      }
      console.log(refreshToken);
      
      const result =await this.userService.refreshToken(refreshToken);
      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("Error in VendorController.refreshToken:", error);
      if (error instanceof Error) {
        if (
          error.message === "Token expired" ||
          error.name === "Token verification failed"
        ) {
          res.status(401).json({ message: "Unauthorized: Token expired" });
          return;
        }
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log(email);

      if (!email) {
        return res
          .status(401)
          .json({ success: false, message: "UnAutherised Approach" });
      }

      const result = this.userService.resendOtp(email);
      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("Error in user resend otp controler:", error);
      if (error instanceof Error) {
        if (error.message === "NO User Found") {
          res.status(401).json({ message: "Unauthorized: Email not valid" });
          return;
        }
      }

      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  
}

export default UserController;
