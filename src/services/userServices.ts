import { UserDoc } from "../interfaces/IUser";
import UserRepository from "../repositories/userRepository";
import generateOtp from "../utils/otp";
import OtpRepository from "../repositories/otpRepository";
import bcrypt from "bcryptjs"
import sendMail from "../utils/mailer";
import {generateToken} from "../utils/jwt"



export class UserService {
  constructor(private userRepository: UserRepository, private otpRepository: OtpRepository) {
    this.userRepository = userRepository
    this.otpRepository = otpRepository
  }
    


  async createUser(user: UserDoc) {
    let email = user.Email
    const existingEmail = await this.userRepository.getUserByEmail(email);
    if (existingEmail) {
      return {
        success: false,
        message: 'Email already exists',
        data: null
      }
        
    }
    console.log("reach the service");
      
    const salt = bcrypt.genSaltSync(10)
    let Password: any = user.Password
       
       
    user.Password = bcrypt.hashSync(Password, salt)

    user.Role = "User"

    const newUser = await this.userRepository.createUser(user);
    if (!newUser) {
      return {
        success: false,
        message: 'Something went wrong',
        data: null
      }
    }
    const newOtp = generateOtp();
    console.log(newOtp);
      
    sendMail('Second Home', 'OTP', newUser.Email, newOtp)
     
    const otp = await this.otpRepository.createOtp({
      Email: email,
      Otp: newOtp,
      CreatedAt: new Date(),
      ExpiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })
      

    return {
      success: true,
      message: 'User created successfully',
    }
      
          
  }
  
  async verifyUser(otp: string, email: string) {
    let otpData = await this.otpRepository.getOtpByEmail(email)
    if (!otpData) {
      console.log('otp not found');
      return {
        
        success: false,
        message: 'Something went wrong',
        data: null
      }
    }
    if (otpData.Otp !== otp) {
      console.log('invalid otp');
      return {
        success: false,
        message: 'Invalid OTP',
        data: null
      }
    }
    if (otpData.ExpiresAt < new Date()) {
      console.log('otp expired');
      
      return {
        success: false,
        message: 'OTP expired',
        data: null
      }
    }


    const user = await this.userRepository.getUserByEmail(email)
    
    if (!user) {
       console.log('user not found');
       
      return {
        success: false,
        message: 'Something went wrong',
        data: null
      }
    }
    user.isVerified = true
    user.save()
    console.log('reach the service');
    
    const token =await generateToken(user)


    return {
      success: true,
      message: 'User verified successfully',
      data: token
    }
  }

}
