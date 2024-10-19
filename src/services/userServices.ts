import { UserDoc } from "../interfaces/IUser";
import UserRepository from "../repositories/userRepository";
import generateOtp from "../utils/otp";
import OtpRepository from "../repositories/otpRepository";
import bcrypt from "bcryptjs";
import sendMail from "../utils/mailer";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import User from "../models/userModel";
import { token } from "morgan";
import { uploadToS3 } from "../utils/s3Bucket";
import { log } from "util";
import { OtpDoc } from "../interfaces/IOtp";

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

    const newUser = await this.userRepository.create(user);
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

    let newOtpData = {
      Email: email,
      Otp: newOtp,
      CreatedAt: new Date(),
      ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUpdated: false,
    }

    const otp = await this.otpRepository.create(newOtpData);

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

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user)
    
    const existingOtp = await this.otpRepository.getOtpByEmail(email)



    const updateOtp = await this.otpRepository.update(existingOtp?._id as string,{Otp:""});
    return {
      success: true,
      message: "User verified successfully",
      data: {
        token,
        refreshToken
      }
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
          const token = generateToken(existingEmail);
          const refreshToken=generateRefreshToken(existingEmail)

          return {
            success: true,
            message: "Login Successful",
            data: {
              token,
              refreshToken
            },
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
        const token = generateToken(newUser)
        const refreshToken=generateRefreshToken(newUser)

        return {
          success: true,
          message: "User Logged in succefully",
          data: {
            token,
            refreshToken
          },
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
      //get form values in array
      let values: string[] = Object.values(user);
    
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

      if (userExist.isVerified === false) {
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
      const token = generateToken(userExist);
      const refreshToken=generateRefreshToken(userExist)
      return {
        success: true,
        message: "Login Successful",
        data: {
          token,refreshToken
        },
      };
    } catch (error) {
      console.error("Error during login:", error);
      return {
        success: false,
        message: "sever error please try again later",
        data: null,
      };
    }
  }
  async forgotPassword(email: string) {
    try {
      console.log("before user service");

      let user = await this.userRepository.getUserByEmail(email);
      console.log("email at forgot service", email);

      if (!user) {
        return {
          success: false,
          message: "Your email is not registered",
          data: null,
        };
      }

      const newOtp = generateOtp();
      sendMail("secondHome", "Forgot Password", user.Email, newOtp);
      const otpData = {
        Otp: newOtp,
        ExpiresAt: new Date(Date.now() + 600000) 
      };
      let existingOtp = await this.otpRepository.getOtpByEmail(email)



    const updateOtp = await this.otpRepository.update(existingOtp?._id as string,otpData);

      console.log(newOtp, "the forgot password otp");

      return {
        success: true,
        message: "Otp sent to your email successfully",
        data: null,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "sever error please try again later",
        data: null,
      };
    }
  }

  async forgotOtpHandle(email: string, otp: string) {
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
      }
      if (otpData.Otp !== otp) {
        console.log("invalid otp");
        return {
          success: false,
          message: "Invalid OTP",
          data: null,
        };
      }
      let updateOtp=await this.otpRepository.update(otpData._id as string,{Otp:''})
      return {
        success: true,
        message: "OTP verified",
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async changePassword(email: string, password:{newPassword:string,confirmPassword:string} ) {
    try {

      
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password.newPassword, salt);

      const userExist =await this.userRepository.getUserByEmail(email)
      
      if (!userExist) {
        return {
          success: false,
          message:'No User Found'
        }
      }
     let id:string=userExist?._id as string
      const user = await this.userRepository.update(id, {
        Password: hashedPassword,
      });

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


  async getUser(token: string) {
    try {
      console.log("getUser");
      let payload = verifyToken(token);

      let id = JSON.parse(JSON.stringify(payload)).payload;

      let user = await this.userRepository.findById(id._id);

      return {
        success: true,
        message: "User details fetched successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        success: false,
        message: "An error occurred while fetching user details",
        data: null,
      };
    }
  }

  async editProfile(token: string, updates: any, file: Express.Multer.File) {
    try {
      let payload = verifyToken(token);

      let id = JSON.parse(JSON.stringify(payload)).payload;

      console.log("user edit payload", id);

      if (file) {
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const key = `upload/${Date.now()}-${file.originalname}`;
        const fileBuffer = file.buffer;
        const mimetype = file.mimetype;
        const imageUrl = await uploadToS3(
          bucketName,
          key,
          fileBuffer,
          mimetype
        );
        updates = { ...updates, Avatar: imageUrl };
      }

      console.log(updates);

      let result = await this.userRepository.update(id._id, updates);

      if (!result) {
        return {
          success: false,
          message: "Something went wrong",
          data: null,
        };
      }

      return {
        success: true,
        message: "Profile updated successfully",
        data: result,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: error,
        data: null,
      };
    }
  }

  async newPassWord(data: any, token: string) {
    try {
      let { oldPassword, newPassword } = data;
      let payload = verifyToken(token);

      let id = JSON.parse(JSON.stringify(payload)).payload;

      console.log('_id from change password',payload);
      

      let existingUser = await this.userRepository.findById(id._id);

      if (!existingUser) {
        return {
            success: false,
            message: "User not found",
        };
    }

      let passwordMatch: boolean = bcrypt.compareSync(
        oldPassword,
        existingUser?.Password!
      );

      if (!passwordMatch) {
        return {
          success: false,
          message: "wrong old password",
        };
      }

        const salt = bcrypt.genSaltSync(10);

        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        let result=await this.userRepository.update(id,{Password:hashedPassword})
      
      return {
        success:true,
        message: 'password changed',
        data:result
      }
    } catch (error) {
      console.log(error);
      return {
        seccess: false,
        message: 'error in change password',
      
      }
    }
  }

  async refreshToken(token:string) {
    try {
      let payload = verifyToken(token)
      const decoded = JSON.parse(JSON.stringify(payload)).payload
      
      const userData = await this.userRepository.findById(decoded._id)
      
      if (!userData) return { success: false, message: 'User Not found' }
      if (!userData.IsActive) throw new Error("Token verification failed")
      
      const accessToken =generateToken(userData)
      const refreshToken = generateToken(userData)
      
      return{ success:true,message:'Token refreshed successfully',data:{accessToken,refreshToken}}
    } catch (error) {
      console.error("Error in refreshToken:", error);
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      let registeredUser = await this.userRepository.getUserByEmail(email)
      
      if (!registeredUser) {
        return {success:false,message:'No user Found'}
      }

      let otp = generateOtp()
      sendMail("secondHome", "Resended Otp", email, otp);
      console.log('resend otp', otp);
      console.log(email);
      
      const otpData = {
        Otp: otp,
        ExpiresAt: new Date(Date.now() + 600000) // Expires in 10 minutes
      };
      let existingOtp = await this.otpRepository.getOtpByEmail(email)



      const updateOtp = await this.otpRepository.update(existingOtp?._id as string,otpData);  
      return {
        success: true,
        message:'otp resend successfully'
     } 
    } catch (error) {
      console.error('Error from Userservice.resendOtp',error);
      
    }
  }
}
