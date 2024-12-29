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
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from "../utils/vadidations";
import { Role } from "../utils/enums";
import { IVendorService } from "../interfaces/IServices";
import { BookingRepository } from "../repositories/bookingRepository";
import { Wallet } from "../models/walletModel";
import { sendNotification } from "../utils/pushNotification";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class VendorService implements IVendorService {
  constructor(
    private _userRepository: UserRepository,
    private _otpRepository: OtpRepository,
    private _hostelRepository: HostelRepository,
    private _bookingRepository: BookingRepository
  ) {
    this._userRepository = _userRepository;
    this._otpRepository = _otpRepository;
    this._hostelRepository = _hostelRepository;
  }

  async createVendor(user: UserDoc) {
    const email = user.Email;
    const existingEmail = await this._userRepository.findByQuery({Email:email});
    if (existingEmail) {
      return {
        success: false,
        message: "Email already exists",
        data: null,
      };
    }
    if (!user.First_name && user.First_name.length <= 5) {
      return {
        success: false,
        message: "First name must be sharacters and constains 5 letters",
      };
    }
    if (!user.Last_name && user.Last_name.length <= 3) {
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

    const salt = bcrypt.genSaltSync(10);
    const Password: string = user.Password;

    user.Password = bcrypt.hashSync(Password, salt);

    user.Role = Role.Vendor;

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
    console.log("vendor:-", user);

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
    const otpData = await this._otpRepository.findByQuery({ Email: email });
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

    const user = await this._userRepository.findByQuery({ Email: email });

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
    const refreshToken = generateRefreshToken(user);
    const existingOtp = await this._otpRepository.findByQuery({ Email: email });
    await this._otpRepository.update(existingOtp?._id as string, { Otp: "" });
    return {
      success: true,
      message: "User verified successfully",
      data: { token, refreshToken },
    };
  }

  async singleSignInVendor(idToken: string, fcmToken: string) {
    try {
      console.log("token fcm vendor", fcmToken);

      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("single sign in servisce");

      const payload = ticket.getPayload();

      if (payload) {
        const { email, given_name, family_name } = payload;

        const existingEmail = await this._userRepository.findByQuery({ Email: email }!);

        if (existingEmail && existingEmail.Password) {
          return {
            success: false,
            message: "Email is also used",
            data: null,
          };
          
        } else if ( existingEmail && existingEmail?.Role!=='Vendor') {
          return {
            success: false,
            message: "Email is also used and not vendor",
            data: null,
          };
          
        } else if (existingEmail) {
          const token = generateToken(existingEmail);
          const refreshToken = generateRefreshToken(existingEmail);
          await this._userRepository.update(existingEmail._id, {
            $set: { fcmToken: fcmToken },
          });
          return {
            success: true,
            message: "Login Successful",
            data: { token, refreshToken },
          };
        }

        const newUser = new User({
          Email: email,
          First_name: given_name,
          Last_name: family_name,
          isVerified: true,
          Role: Role.Vendor,
          fcmToken,
        });

        await newUser.save();
        const token = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        return {
          success: true,
          message: "User Logged in succefully",
          data: { token, refreshToken },
        };
      }

      return {
        success: false,
        message: "User Logged in failed",
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

  async loginVendor(user: { [key: string]: string }) {
    try {
      const userExist = await this._userRepository.findByQuery({Email:user.Email});

      if (!userExist) {
        console.error("User not found");
        return {
          success: false,
          message: "User not found, please register",
          data: null,
        };
      }

      const values: string[] = Object.values(user);
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
      if (userExist.Role !== Role.Vendor) {
        return {
          success: false,
          message: "Only vendor can login",
          data: null,
        };
      }
      const token = generateToken(userExist);
      const refreshToken = generateRefreshToken(userExist);
      console.log('vendor fcm Token',user.fcmToken);
      await this._userRepository.update(userExist._id, { $set: { fcmToken: user.fcmToken } })

      return {
        success: true,
        message: "Login Successful",
        data: { token, refreshToken },
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

      const user = await this._userRepository.findByQuery({ Email: email });
      console.log("email at forgot service", email);

      if (!user) {
        return {
          success: false,
          message: "Your email is not registered",
          data: null,
        };
      }

      if (user.Role !== Role.Vendor) {
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
        ExpiresAt: new Date(Date.now() + 600000), // Expires in 10 minutes
      };
      const existingOtp = await this._otpRepository.findByQuery({ Email: email });
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

  async changePasswordVendor(
    email: string,
    password: { [key: string]: string }
  ) {
    try {
      const salt = bcrypt.genSaltSync(10);

      if (isValidPassword(password.newPassword) === false) {
        return {
          success: false,
          message: "enter a valid password",
        };
      }

      const hashedPassword = bcrypt.hashSync(password?.newPassword, salt);

      const userExist = await this._userRepository.findByQuery({ Email: email });

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
        message: "Passs word changing failed",
      };
    }
  }

  async forgotOtpHandler(email: string, otp: string) {
    try {
      const otpData = await this._otpRepository.findByQuery({ Email: email });
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

      const userExist = await this._userRepository.findByQuery({ Email: email });

      if (!userExist) {
        return {
          success: false,
          message: "No User Found",
        };
      }
      const id: string = userExist?._id as string;
      const result = await this._userRepository.update(id, {
        lisence: imageUrl,
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

  async newPassWord(
    data: { oldPassword: string; newPassword: string },
    token: string
  ) {
    try {
      const { oldPassword, newPassword } = data;
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      if (isValidPassword(newPassword) === false) {
        return {
          success: false,
          message: "enter a valid password",
        };
      }

      const existingUser: UserDoc | null = await this._userRepository.findById(
        id._id
      );

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

      if (!payload || !decoded) {
        return {success:false,message:"Please Login"}
     }

      const userData = await this._userRepository.findById(decoded._id);

      if (!userData) return { success: false, message: "Vendor Not found" };
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
      const registeredUser = await this._userRepository.findByQuery({ Email: email });

      if (!registeredUser) {
        return { success: false, message: "No user Found" };
      }

      const otp = generateOtp();
      sendMail("secondHome", "Resended Otp", email, otp);

      console.log("vendor resend Otp:-", otp);

      const otpData = {
        Otp: otp,
        ExpiresAt: new Date(Date.now() + 600000),
      };
      const existingOtp = await this._otpRepository.findByQuery({ Email: email });
      await this._otpRepository.update(existingOtp?._id as string, otpData);
      return {
        success: true,
        message: "otp resend successfully",
      };
    } catch (error) {
      console.error("Error from Userservice.resendOtp", error);
      return {
        success: false,
        message: "resend otp failed",
      };
    }
  }

  async getAllHostels(page: number, searchQuery: string, token: string) {
    try {
      const skip = (page - 1) * 5;
      const payload = verifyToken(token);
      const decoded = JSON.parse(JSON.stringify(payload)).payload;

      const filter: { [key: string]: unknown } = {
        owner: decoded._id,
      };

      if (searchQuery) {
        filter["$or"] = [
          { name: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ];
      }
      const hostels = await this._hostelRepository.findAll(filter, skip,'');

      return {
        success: true,
        message: "hostel fetched successfully",
        data: hostels,
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: "internal sever error" };
    }
  }

  async getAllBookings(page: string, token: string) {
    try {
      const skip: number = (Number(page) - 1) * 5;

      const payload = verifyToken(token);
      const decoded = JSON.parse(JSON.stringify(payload)).payload;

      const bookings = await this._bookingRepository.getAllBookingsWithHostels(
        { vendorId: decoded._id },
        skip
      );

      return {
        success: true,
        message: "Hostels fetched success fully",
        data: bookings,
      };
    } catch (error) {
      console.error("Error form vendor service hostel get booking", error);
    }
  }

  async confirmCancel(id: string) {
    try {
      const canceling = await this._bookingRepository.update(id, {
        isActive: false,
      });

      const hostelItem = {
        _id: canceling?.hostelId,
        "rates.type": canceling?.bedType,
      };
   

      const updation = {
        $inc: { "rates.$.quantity": canceling?.numberOfGuests },
      };

      await this._hostelRepository.updateHostel(hostelItem, updation);

      console.log("vendorId:", canceling?.vendorId);

      const vendorWallet = await Wallet.findOne({
        userId: canceling?.vendorId.toString(),
      });
      if (vendorWallet && canceling) {
        console.log("entered wallet");

        vendorWallet.WalletBalance -= canceling.totalAmount;
        vendorWallet?.transaction.push({
          type: "debit",
          description: `amount returened for cancel hostel`,
          from: canceling.vendorId,
          amount: canceling.totalAmount,
        });
        await vendorWallet.save();
      } else if (canceling) {
        await Wallet.create({
          userId: canceling.vendorId,
          WalletBalance: 0,
          transaction: [
            {
              type: "debit",
              description: `hostel booking cancelled `,
              from: canceling.vendorId,
              amount: canceling.totalAmount,
            },
          ],
        });
      }
      const userWallet = await Wallet.findOne({
        userId: canceling?.userId.toString(),
      });
      if (userWallet && canceling) {
        console.log("entered wallet");

        userWallet.WalletBalance += canceling.totalAmount;
        userWallet?.transaction.push({
          type: "credit",
          description: `amount returened for booking cancel`,
          from: canceling.vendorId,
          amount: canceling.totalAmount,
        });
        await userWallet.save();
      } else if (canceling) {
        await Wallet.create({
          userId: canceling.userId,
          WalletBalance: canceling.totalAmount,
          transaction: [
            {
              type: "credit",
              description: ` hostel puchased `,
              from: canceling.vendorId,
              amount: canceling.totalAmount,
            },
          ],
        });
      }

      if (canceling) {
        const vendor: UserDoc | null = await User.findById(canceling.vendorId);
        const user: UserDoc | null = await User.findById(canceling.userId);

        const title = "Approved Cancel booking request";
        const body = `${vendor?.First_name} approved cancel request`;
        const pic = user?.Avatar;
        sendNotification(user?.fcmToken as string, title, body, pic as string);
        return {
          success: true,
          message: "cancel confirmed",
        };
      }
    } catch (error) {
      console.error("Error from confirmcancel vendor sevice:-", error);
      return {
        success: false,
        message: "Confirm Canceling booking failed",
      };
    }
  }

  async getUserWallet(token: string) {
    try {
      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      const wallet = await Wallet.findOne({ userId: id._id });

      if (!wallet) {
        return {
          success: false,
          message: "wallet not found",
        };
      }

      return {
        success: true,
        message: "Wallet fetched successfully",
        data: wallet,
      };
    } catch (error) {
      console.error("Error from Userservice.getUserWallet", error);
      return {
        success: false,
        message: "Failed to fetch wallet",
      };
    }
  }
}
