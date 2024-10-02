import { UserDoc } from "../interfaces/IUser";
import UserRepository from "../repositories/userRepository";
import generateOtp from "../utils/otp";
import OtpRepository from "../repositories/otpRepository";
import bcrypt from "bcryptjs";
import sendMail from "../utils/mailer";
import { generateToken } from "../utils/jwt";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import User from "../models/userModel";
import { token } from "morgan";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private otpRepository: OtpRepository
  ) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
  }

  async createUser(user: UserDoc) {
    let email = user.Email;
    const existingEmail = await this.userRepository.getUserByEmail(email);
    if (existingEmail) {
      return {
        success: false,
        message: "Email already exists",
        data: null,
      };
    }
    console.log("reach the service");

    const salt = bcrypt.genSaltSync(10);
    let Password: any = user.Password;

    user.Password = bcrypt.hashSync(Password, salt);

    user.Role = "User";

    const newUser = await this.userRepository.createUser(user);
    if (!newUser) {
      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    }
    const newOtp = generateOtp();
    console.log(newOtp);

    sendMail("Second Home", "OTP", newUser.Email, newOtp);

    const otp = await this.otpRepository.createOtp({
      Email: email,
      Otp: newOtp,
      CreatedAt: new Date(),
      ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUpdated: false,
    });

    return {
      success: true,
      message: "User created successfully",
    };
  }

  async verifyUser(otp: string, email: string) {
    let otpData = await this.otpRepository.getOtpByEmail(email);
    if (!otpData) {
      console.log("otp not found");
      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    }
    if (otpData.Otp !== otp) {
      console.log("invalid otp");
      return {
        success: false,
        message: "Invalid OTP",
        data: null,
      };
    }
    if (otpData.ExpiresAt < new Date()) {
      console.log("otp expired");

      return {
        success: false,
        message: "OTP expired",
        data: null,
      };
    }

    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      console.log("user not found");

      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    }
    user.isVerified = true;
    user.save();
    console.log("reach the service");

    const token = await generateToken(user);
    const updateOtp = await this.otpRepository.updateOtp(email, "");
    return {
      success: true,
      message: "User verified successfully",
      data: token,
    };
  }

  async singleSignIn(idToken: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("single sign in servisce");

      const payload = ticket.getPayload();

      if (payload) {
        const { email, given_name, family_name } = payload;

        const existingEmail = await this.userRepository.getUserByEmail(email!);

        if (existingEmail && existingEmail.Password) {
          return {
            success: false,
            message: "Email is also used",
            data: null,
          };
        } else if (existingEmail) {
          const token = generateToken(existingEmail._id);

          return {
            success: true,
            message: "Login Successful",
            data: token,
          };
        }

        let newUser = new User({
          Email: email,
          First_name: given_name,
          Last_name: family_name,
          isVerified: true,
          Role: "User",
        });

        await newUser.save();

        return {
          success: true,
          message: "User Logged in succefully",
          data: generateToken(newUser._id),
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async loginUser(user: any) {
    try { 
        const userExist = await this.userRepository.getUserByEmail(user.Email);
        
        if (!userExist) {
            console.error("User not found");
            return {
                success: false,
                message: "User not found, please register",
                data: null,
            };
        }

      console.log('Logging in user:', user);
      let values:string[]=Object.values(user)
        console.log('Incoming password:', values[1]);
        console.log('Saved hash:', userExist?.Password);
        
        const passwordMatch: boolean = bcrypt.compareSync(
            values[1],
            userExist?.Password
        );

        if (!passwordMatch) {
            console.error("Password incorrect");
            return {
                success: false,
                message: "Password incorrect",
                data: null,
            };
      }
      
      if (userExist.isVerified===false) { 
        return {
          success: false,
          message: "Please verify your email",
          data: null,
        };
      }
      if (!userExist.IsActive) {
        return {
          success: false,
          message: "Your account is blocked",
          data: null,
        };
      }
      if (userExist.Role !== "User") {
        return {
          success: false,
          message: "Only user can login",
          data: null,
        };
      }
      const token = generateToken(userExist._id);
      return {
        success: true,
        message: "Login Successful",
        data: token,
      };
    } catch (error) {
      console.error("Error during login:", error);
      return {
        success: false,
        message: 'sever error please try again later',
        data: null,
      }
    }
}
  async forgotPassword(email: string) {
    try {
      console.log('before user service');
      
      let user = await this.userRepository.getUserByEmail( email );
      console.log('email at forgot service', email);
      
       
      if (!user) {
        return {
          success: false,
          message: "Your email is not registered",
          data: null,
        }
      }
    
      const newOtp = generateOtp();
      sendMail('secondHome', "Forgot Password", user.Email, newOtp);
      const updateOtp = await this.otpRepository.updateOtp(email, newOtp);
      
      console.log(newOtp,'the forgot password otp');
      
      return {
        success: true,
        message: "Otp sent to your email successfully",
        data: null,
      }
    
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'sever error please try again later',
        data: null,
      }
      
    }
  }

 async forgotOtpHandle(email:string,otp:string) {
   try {
    let otpData = await this.otpRepository.getOtpByEmail(email);
    if (!otpData) {
      console.log("otp not found");
      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    } 
 
    if (otpData.ExpiresAt < new Date()) { 
      console.log("otp expired");
      return {
        success: false,
        message: "OTP expired",
        data: null,
      };
    } if (otpData.Otp !== otp) {
      console.log("invalid otp");
      return {
        success: false,
        message: "Invalid OTP",
        data: null,
      }
    }
 
    return {
      success: true,
      message: "OTP verified",
      data: null,
    }
   } catch (error) {
     console.log(error);
   }
  }

  async changePassword(email: string, password: string) {
    try {
      const salt = bcrypt.genSaltSync(10);

      const hashedPassword = bcrypt.hashSync(password, salt);
  
      const user = await this.userRepository.updateUserByEmail(email, { Password: hashedPassword });
      
      if (!user) {
        return {
          success: false,
          message: "Something went wrong",
          data: null,
        };
      }
      return {
        success: true,
        message: "Password changed successfully",
        data: null,
      };
    
    } catch (error) {
      console.log(error);
      
    } 
  }
}
