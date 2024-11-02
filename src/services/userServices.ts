import { UserDoc } from "../interfaces/IUser";
import UserRepository from "../repositories/userRepository";
import generateOtp from "../utils/otp";
import OtpRepository from "../repositories/otpRepository";
import bcrypt from "bcryptjs";
import sendMail from "../utils/mailer";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel";
import { getPredesignedUrl, uploadToS3 } from "../utils/s3Bucket";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from "../utils/vadidations";
import { Role } from "../utils/enums";
import { IUserSrvice } from "../interfaces/IServices";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class UserService implements IUserSrvice{
  constructor(
    private _userRepository: UserRepository,
    private _otpRepository: OtpRepository
  ) {
    this._userRepository = _userRepository;
    this._otpRepository = _otpRepository;
  }

  async createUser(user: UserDoc) {
    const email = user.Email;
    const existingEmail = await this._userRepository.getUserByEmail(email);
    if (existingEmail) {
      return {
        success: false,
        message: "Email already exists",
        data: null,
      };
    }

    const salt = bcrypt.genSaltSync(10);
    const Password: string = user.Password;

    if (!user.First_name || user.First_name.length <= 5) {
      return {
        success: false,
        message: "First name must be sharacters and constains 5 letters",
      };
    }
    if (!user.Last_name || user.Last_name.length <= 3) {
      return {
        success: false,
        message: "Last name must be sharacters and constains 5 letters",
      };
    }
    if (isValidPhone(user.Phone) === false) {
      return {
        success: false,
        message: "Password must be valid",
      };
    }
    if (isValidPassword(user.Password) === false) {
      return {
        success: false,
        message: "Password must be valid",
      };
    }
    if (isValidEmail(user.Email) === false) {
      return {
        success: false,
        message: "Password must be valid",
      };
    }

    user.Password = bcrypt.hashSync(Password, salt);

    user.Role = Role.User;

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

    const newOtpData = {
      Email: email,
      Otp: newOtp,
      CreatedAt: new Date(),
      ExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isUpdated: false,
    };

    await this._otpRepository.create(newOtpData);

    return {
      success: true,
      message: "User created successfully",
    };
  }

  async verifyUser(otp: string, email: string) {
    try {
      const otpData = await this._otpRepository.getOtpByEmail(email);
      if (!otpData) {
        console.log("otp not found");
        return {
          success: false,
          message: "invalid Otp",
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

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      const existingOtp = await this._otpRepository.getOtpByEmail(email);

      await this._otpRepository.update(existingOtp?._id as string, { Otp: "" });
      return {
        success: true,
        message: "User verified successfully",
        data: {
          token,
          refreshToken,
        },
      };
    } catch (error) {
      console.error("UserVerify otp", error);
      return {
        success: false,
        message:'Failed to verify User Otp'
      }
    }
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

        const existingEmail = await this._userRepository.getUserByEmail(email!);

        if (existingEmail && existingEmail.Password) {
          return {
            success: false,
            message: "Email is also used",
            data: null,
          };
        } else if (existingEmail) {
          const token = generateToken(existingEmail);
          const refreshToken = generateRefreshToken(existingEmail);

          return {
            success: true,
            message: "Login Successful",
            data: {
              token,
              refreshToken,
            },
          };
        }

        const newUser = new User({
          Email: email,
          First_name: given_name,
          Last_name: family_name,
          isVerified: true,
          Role: Role.User,
        });

        await newUser.save();
        const token = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        return {
          success: true,
          message: "User Logged in succefully",
          data: {
            token,
            refreshToken,
          },
        };
      }
      return {
        success: false,
        message:"User Login Failed"
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message:'Failed to User Login'
      }
    }
  }

  async loginUser(user: { [key: string]: unknown }) {
    try {
      const userExist = await this._userRepository.getUserByEmail(
        user.Email as string
      );

      if (!userExist) {
        console.error("User not found");
        return {
          success: false,
          message: "User not found, please register",
          data: null,
        };
      }
      //get form values in array
      const values: unknown[] = Object.values(user);
      if (isValidEmail(values[0] as string) === false) {
        return {
          success: false,
          message: "enter a valid email",
          data: null,
        };
      }
      if (isValidPassword(values[1] as string) === false) {
        return {
          success: false,
          message: "enter valid password",
          data: null,
        };
      }

      const passwordMatch: boolean = bcrypt.compareSync(
        values[1] as string,
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
      if (userExist.Role !== Role.User) {
        return {
          success: false,
          message: "Only user can login",
          data: null,
        };
      }

      const token = generateToken(userExist);
      const refreshToken = generateRefreshToken(userExist);
      return {
        success: true,
        message: "Login Successful",
        data: {
          token,
          refreshToken,
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

      const user = await this._userRepository.getUserByEmail(email);
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
        ExpiresAt: new Date(Date.now() + 600000),
      };
      const existingOtp = await this._otpRepository.getOtpByEmail(email);

      await this._otpRepository.update(existingOtp?._id as string, otpData);

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
      await this._otpRepository.update(otpData._id as string, { Otp: "" });
      return {
        success: true,
        message: "OTP verified",
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message:'Failed to User Login'
      }
    }
  }

  async changePassword(
    email: string,
    password: { newPassword: string; confirmPassword: string }
  ) {
    try {
      const salt = bcrypt.genSaltSync(10);

      if (isValidPassword(password.newPassword) === false) {
        return {
          success: false,
          message: "enter a valid password",
        };
      }

      const hashedPassword = bcrypt.hashSync(password.newPassword, salt);
      const userExist = await this._userRepository.getUserByEmail(email);

      if (!userExist) {
        return {
          success: false,
          message: "No User Found",
        };
      }
      const id: string = userExist?._id as string;
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
      return {
        success: false,
        message:'Failed to User Login'
      }
    }
  }

  async getUser(token: string) {
    try {
      console.log("getUser");
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      const user = await this._userRepository.findById(id._id);

        if (user?.Avatar) {
          const key = user.Avatar.split(`.s3.amazonaws.com/`)[1]
            user.Avatar=await getPredesignedUrl(process.env.AWS_S3_BUCKET_NAME!,key)
        }
      
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

  async editProfile(
    token: string,
    updates: { [key: string]: unknown },
    file: Express.Multer.File
  ) {
    try {
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      if (
        typeof updates.First_name === "string" &&
        updates.First_name.length < 5
      ) {
        return {
          success: false,
          message: "First name must be sharacters and constains 5 letters",
        };
      }
      if (
        typeof updates.Last_name === "string" &&
        updates.Last_name.length < 3
      ) {
        return {
          success: false,
          message: "Last name must be sharacters and constains 5 letters",
        };
      }
      if (isValidPhone(updates.Phone as number) === false) {
        return {
          success: false,
          message: "Phone Number must be valid",
        };
      }
      if (isValidEmail(updates.Email as string) === false) {
        return {
          success: false,
          message: "Password must be valid",
        };
      }

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
        message: error as string,
        data: null,
      };
    }
  }

  async newPassWord(data: { [key: string]: string }, token: string) {
    try {
      const { oldPassword, newPassword } = data;
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      console.log(newPassword);

      if (isValidPassword(newPassword) === false) {
        return {
          success: false,
          message: "enter a valid password",
        };
      }

      const existingUser = await this._userRepository.findById(id._id);

      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const passwordMatch: boolean = bcrypt.compareSync(
        oldPassword,
        existingUser.Password!
      );

      if (!passwordMatch) {
        return {
          success: false,
          message: "wrong old password",
        };
      }
      const salt = bcrypt.genSaltSync(10);

      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      const result = await this._userRepository.update(id, {
        Password: hashedPassword,
      });

      return {
        success: true,
        message: "password changed",
        data: result,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "error in change password",
      };
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = verifyToken(token);
      const decoded = JSON.parse(JSON.stringify(payload)).payload;

      const userData = await this._userRepository.findById(decoded._id);

      if (!userData) return { success: false, message: "User Not found" };
      if (!userData.IsActive) throw new Error("Token verification failed");

      const accessToken = generateToken(userData);
      const refreshToken = generateRefreshToken(userData);

      return {
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken, refreshToken },
      };
    } catch (error) {
      console.error("Error in refreshToken:", error);
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      const registeredUser = await this._userRepository.getUserByEmail(email);

      if (!registeredUser) {
        return { success: false, message: "No user Found" };
      }

      const otp = generateOtp();
      sendMail("secondHome", "Resended Otp", email, otp);
      console.log("resend otp", otp);
      console.log(email);

      const otpData = {
        Otp: otp,
        ExpiresAt: new Date(Date.now() + 600000), // Expires in 10 minutes
      };
      const existingOtp = await this._otpRepository.getOtpByEmail(email);

      await this._otpRepository.update(existingOtp?._id as string, otpData);
      return {
        success: true,
        message: "otp resend successfully",
      };
    } catch (error) {
      console.error("Error from Userservice.resendOtp", error);
      return {
        success: false,
        message:'Failed to Resend Otp'
      }
    }
  }
}
