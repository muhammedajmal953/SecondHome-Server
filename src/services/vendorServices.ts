import { OAuth2Client } from "google-auth-library";
import OtpRepository from "../repositories/otpRepository";
import UserRepository from "../repositories/userRepository";
import { UserDoc } from "../interfaces/IUser";
import bcrypt from "bcryptjs";
import generateOtp from "../utils/otp";
import sendMail from "../utils/mailer";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import User from "../models/userModel";
import { uploadToS3 } from "../utils/s3Bucket";
import { HostelRepository } from "../repositories/hostelRepository";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class VendorService {
  constructor(
    private _userRepository: UserRepository,
    private _otpRepository: OtpRepository,
    private _hostelRepository:HostelRepository
  ) {
    this._userRepository = _userRepository;
    this._otpRepository = _otpRepository;
    this._hostelRepository = _hostelRepository;
  }

  async createVendor(user: UserDoc) {
    const email = user.Email;
    const existingEmail = await this._userRepository.getUserByEmail(email);
    if (existingEmail) {
      return {
        success: false,
        message: "Email already exists",
        data: null,
      };
    }
    console.log("reach the service");

    const salt = bcrypt.genSaltSync(10);
    const Password: string = user.Password;

    user.Password = bcrypt.hashSync(Password, salt);

    user.Role = "Vendor";

    const newUser = await this._userRepository.create(user);
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

    await this._otpRepository.create({
      Email: email,
      Otp: newOtp,
      CreatedAt: new Date(),
      ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUpdated: false,
    });

    return {
      success: true,
      message: "You are now the Second Home Vendor",
    };
  }

  async verifyVendor(otp: string, email: string) {
    const otpData = await this._otpRepository.getOtpByEmail(email);
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

    const user = await this._userRepository.getUserByEmail(email);

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

    const token = generateToken(user);
    const refreshToken=generateRefreshToken(user)
    const existingOtp = await this._otpRepository.getOtpByEmail(email)
    await this._otpRepository.update(existingOtp?._id as string,{Otp:""});
    return {
      success: true,
      message: "User verified successfully",
      data: {token,refreshToken},
    };
  }

  async singleSignInVendor(idToken: string) {
    try {
      console.log("id token vendor", idToken);

      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("single sign in servisce");

      const payload = ticket.getPayload();

      if (payload) {
        const { email, given_name, family_name } = payload;

        const existingEmail = await this._userRepository.getUserByEmail(email!);

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
            data: {token,refreshToken},
          };
        }

        const newUser = new User({
          Email: email,
          First_name: given_name,
          Last_name: family_name,
          isVerified: true,
          Role: "Vendor",
        });

        await newUser.save();
        const token = generateToken(newUser)
        const refreshToken=generateRefreshToken(newUser)

        return {
          success: true,
          message: "User Logged in succefully",
          data: {token,refreshToken},
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    }
  }

  async loginVendor(user: {[key:string]:string}) {
    try {
      const userExist = await this._userRepository.getUserByEmail(user.Email);

      if (!userExist) {
        console.error("User not found");
        return {
          success: false,
          message: "User not found, please register",
          data: null,
        };
      }

      console.log("Logging in user:", user);
      const values: string[] = Object.values(user);
      console.log("Incoming password:", values[1]);
      console.log("Saved hash:", userExist?.Password);

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

      if (!userExist.IsActive) {
        return {
          success: false,
          message: "You are blocked by admin",
          data: null,
        };
      }

      if (!userExist.IsActive) {
        return {
          success: false,
          message: "You are blocked by admin",
          data: null,
        };
      }

      if (!userExist.isVerified) {
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
      if (userExist.Role !== "Vendor") {
        return {
          success: false,
          message: "Only vendor can login",
          data: null,
        };
      }
      const token = generateToken(userExist);
      const refreshToken=generateRefreshToken(userExist)

      return {
        success: true,
        message: "Login Successful",
        data: {token,refreshToken},
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

      const user = await this._userRepository.getUserByEmail(email);
      console.log("email at forgot service", email);

      if (!user) {
        return {
          success: false,
          message: "Your email is not registered",
          data: null,
        };
      }

      if (user.Role !== "Vendor") {
        return {
          success: false,
          message: "Please Enter a Vendor Email",
          data: null,
        };
      }

      const newOtp = generateOtp();
      sendMail("secondHome", "Forgot Password", user.Email, newOtp);
      const otpData = {
        Otp: newOtp,
        ExpiresAt: new Date(Date.now() + 600000) // Expires in 10 minutes
      };
      const existingOtp = await this._otpRepository.getOtpByEmail(email)
       await this._otpRepository.update(existingOtp?._id as string,otpData);

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

  async changePasswordVendor(email: string, password: {[key:string]:string}) {
    try {
      const salt = bcrypt.genSaltSync(10);
      console.log(password,'change password vendor');
      
      const hashedPassword = bcrypt.hashSync(password?.newPassword, salt);

      const userExist =await this._userRepository.getUserByEmail(email)
      
      if (!userExist) {
        return {
          success: false,
          message:'No User Found'
        }
      }
     const id:string=userExist?._id as string
      const user = await this._userRepository.update(id, {
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

  async forgotOtpHandler(email: string, otp: string) {
    try {
      const otpData = await this._otpRepository.getOtpByEmail(email);
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

      return {
        success: true,
        message: "OTP verified",
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    }
  }

  async kycUpload(email: string, file: Express.Multer.File) {
    try {
      console.log(file, "servise that builed for kyc upload");

      if (!file) {
        return {
          success: false,
          message: "Something went wrong",
          data: null,
        };
      }

      const bucketName = process.env.AWS_S3_BUCKET_NAME!;

      const key = `upload/${Date.now()}-${file.originalname}`;

      const fileBuffer = file.buffer;

      const mimetype = file.mimetype;

      const imageUrl = await uploadToS3(bucketName, key, fileBuffer, mimetype);

      if (!imageUrl) {
        return {
          success: false,
          message: "Image Upload Failed",
          data: null,
        };
      }

      const userExist =await this._userRepository.getUserByEmail(email)
      
      if (!userExist) {
        return {
          success: false,
          message:'No User Found'
        }
      }
     const id:string=userExist?._id as string
      const result = await this._userRepository.update(id, {
        lisence:imageUrl
      });
      if (!result) {
        return {
          success: false,
          message: "Something went wrong",
          data: null,
        };
      }

      return {
        success: true,
        message: "Image Upload Successful",
        data: imageUrl,
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Something went wrong",
        data: null,
      };
    }
  }

  async getVendorDtails(token: string) {
    try {
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      const user = await this._userRepository.findById(id._id);

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

  async editProfile(token: string, updates: {[key:string]:unknown}, file: Express.Multer.File) {
    try {
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

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

      const result = await this._userRepository.update(id._id, updates);

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

  async newPassWord(data:{oldPassword:string,newPassword:string}, token: string) {
    try {
      const { oldPassword, newPassword } = data;
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      const existingUser:UserDoc|null = await this._userRepository.findById(id._id);

      const passwordMatch: boolean = bcrypt.compareSync(
        oldPassword,
        existingUser?.Password as string
      );

      if (!passwordMatch) {
        return {
          success: false,
          message: "wrong old password",
        };
      }

      const salt = bcrypt.genSaltSync(10);

      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      const result = await this._userRepository.update(id, {Password:hashedPassword});

      return {
        success: true,
        message: "password changed",
        data: result,
      };
    } catch (error) {
      console.log(error);
      return {
        seccess: false,
        message: "error in change password",
      };
    }
  }
  async refreshToken(token:string) {
    try {
      const payload = verifyToken(token)
      const decoded = JSON.parse(JSON.stringify(payload)).payload
      
      const userData = await this._userRepository.findById(decoded._id)
      
      if (!userData) return { success: false, message: 'Vendor Not found' }
      if (!userData.IsActive) throw new Error("Token verification failed")
      
      const accessToken =generateToken(userData)
      const refreshToken = generateRefreshToken(userData)
      
      return{ success:true,message:'Token refreshed successfully',data:{accessToken,refreshToken}}
    } catch (error) {
      console.error("Error in refreshToken:", error);
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      const registeredUser = await this._userRepository.getUserByEmail(email)
      
      if (!registeredUser) {
        return {success:false,message:'No user Found'}
      }

      const otp = generateOtp()
      sendMail("secondHome", "Resended Otp", email, otp);

      console.log('vendor resend Otp:-',otp);
      
      const otpData = {
        Otp: otp,
        ExpiresAt: new Date(Date.now() + 600000) 
      };
      const existingOtp = await this._otpRepository.getOtpByEmail(email)
      await this._otpRepository.update(existingOtp?._id as string,otpData);
      return {
        success: true,
        message:'otp resend successfully'
     } 
    } catch (error) {
      console.error('Error from Userservice.resendOtp',error);  
    }
  }

 async getAllHostels(page:number,searchQuery:string,token:string) {
    try {
      const skip = (page - 1) * 5
      const payload = verifyToken(token)
      const decoded = JSON.parse(JSON.stringify(payload)).payload
           
      const filter: { [key: string]: unknown } = {
        owner:decoded._id
      }
      
      if (searchQuery) {
          filter['$or'] = [
              { name: { $regex: searchQuery, $options: 'i' } },
              {category:{ $regex: searchQuery, $options:'i'}}
          ] 
      }
      const hostels = await this._hostelRepository.findAll(filter, skip)
      
      return {
        success: true,
        message: 'hostel fetched successfully',
        data:hostels
      }
    } catch (error) {
      console.log(error);
      
    }
    
  }
}

