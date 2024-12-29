import { UserDoc } from "../interfaces/IUser";
import { HostelRepository } from "../repositories/hostelRepository";
import UserRepository from "../repositories/userRepository";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword } from "../utils/vadidations";
import { Role } from "../utils/enums";
import { IAdminService } from "../interfaces/IServices";
import { BookingRepository } from "../repositories/bookingRepository";
import User from "../models/userModel";
import Hostel from "../models/hostelModel";
import { Booking } from "../models/bookingModels";

export class AdminServices implements IAdminService{
    constructor(private _userRepository: UserRepository, private _hotelRepository: HostelRepository,private _bookingRepository:BookingRepository) { }
    

    async loginUser(admin: Partial<UserDoc>) {
        try { 
            const adminExist = await this._userRepository.findByQuery({Email:admin.Email!});
    
            if (!adminExist) {
                console.error("admin not found");
                return {
                    success: false,
                    message: "admin not found, please register",
                    data: null,
                };
            }
    
            //get elements from the object
            const values: string[] = Object.values(admin)
            if (isValidEmail(values[0] as string)===false) {
                return {
                  success: false,
                  message: "enter a valid email",
                  data: null,
                };
              }
              if (isValidPassword(values[1] as string)===false) {
                return {
                  success: false,
                  message: "enter valid password",
                  data: null,
                };
              }
            
            const passwordMatch: boolean = bcrypt.compareSync(
                values[1],
                adminExist?.Password
            );
    
            if (!passwordMatch) {
                console.error("Password incorrect");
                return {
                    success: false,
                    message: "Password incorrect",
                    data: null,
                };
            }
    
         
          
            if (adminExist.Role !== Role.Admin||!adminExist.IsAdmin) { 
                return {
                    success: false,
                    message: "Unauthorized access",
                    data: null,
                }
            }
            const token = generateToken(adminExist);
            const refreshToken=generateRefreshToken(adminExist)
          return {
            success: true,
            message: "Login Successful",
              data: {
                  token,
                  refreshToken
              }
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

    async getAllUsers(name:string,page: number, limit: number) {
      
        const newLimit = limit * (page - 1)
        const filter:{[key:string]:unknown}={ Role: Role.User }
        if (name) {
            filter['$or'] = [
                { First_name: { $regex: name, $options: 'i' } },
                {Email:{$regex:name,$options:'i'}},
            ]
        }
       
        const users = await this._userRepository.findAll(filter, newLimit,'')
        return {
            success: true,
            message: "Users fetched successfully",
            data: users,
        }
    }
    async getAllVendors(name:string,page: number, limit: number) {
      
        const newLimit = limit * (page - 1)
        const filter:{[key:string]:unknown}={ Role: Role.Vendor }
        if (name) {
            filter['$or'] = [
                { First_name: { $regex: name, $options: 'i' } },
                {Email:{$regex:name,$options:'i'}},
            ]
        }
        const users = await this._userRepository.findAll(filter, newLimit,'')
        
        return {
            success: true,
            message: "Users fetched successfully",
            data: users,
        } 
    }
    
    async blockUser(id: string) {
        const user = await this._userRepository.findById(id)
        
        if(!user){
            return {
                success: false,
                message: "User not found",
                data: null,
            }
        }

        user.IsActive = false
        await user.save()
        return {
            success: true,
            message: "User blocked successfully",
            data: null,
        }
    }
    async unBlockUser(id: string) {
        const user = await this._userRepository.findById(id)
        
        if(!user){
            return {
                success: false,
                message: "User not found",
                data: null,
            }
        }

        user.IsActive = true
        await user.save()
        return {
            success: true,
            message: "User blocked successfully",
            data: null,
        }
    }

    async verifyVendor(_id: string) {
        try {
            const verification = await this._userRepository.update(_id,{isKYCVerified:true})

            if (!verification) { 
              
                return {
                    success: false,
                    message: "User not found",
                    data: null,
                }
            }
            
            return {
                success: true,
                message: "User verified successfully",
                data: verification,
            }
        } catch (error) {
            console.error('Error from adminService.verifyVendor', error)
            return {
                success: false,
                message: 'failed to verify vendor'
            }
        }

    }

    async refreshToken(token:string) {
        try {
          const payload = verifyToken(token)
            const decoded = JSON.parse(JSON.stringify(payload)).payload
            
            if (!payload || !decoded) {
                return {success:false,message:"Please Login"}
            }
          
          const userData = await this._userRepository.findById(decoded._id)
          
          if (!userData) return { success: false, message: 'Admin Not found' }
          if (!userData.IsAdmin) throw new Error("Token verification failed")
          
          const accessToken =generateToken(userData)
          const refreshToken = generateRefreshToken(userData)
          
          return{ success:true,message:'Token refreshed successfully',data:{accessToken,refreshToken}}
        } catch (error) {
          console.error("Error in refreshToken:", error);
          throw error;
        }
    } 
    
    async getAllHostel(page: number, searchQuery: string) {
        try {
          const skip = (page - 1) * 5;
            console.log(skip);
            
          const filter: { [key: string]: unknown } = {};
    
          if (searchQuery) {
            filter["$or"] = [
              { name: { $regex: searchQuery, $options: "i" } },
              { category: { $regex: searchQuery, $options: "i" } },
            ];
          }
          const hostels = await this._hotelRepository.findAll(filter, skip,'');
          hostels.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return {
            success: true,
            message: "All hostels are fetched",
            data: hostels,
          };
        } catch (error) {
          console.log(error);
            return {
                success: false,
                message:'Failed To fetch hostel'
          }
        }
    }
    
    async getAllBookings(page:number) {
        try {
            const skip:number=(page-1)*5
            const bookings = await this._bookingRepository.BookingsWithAllDetails(skip) 
            return {
                success: true,
                message: 'Bookings fetched successfully',
                data:bookings
            }
        } catch (error) {
            console.log('Error from getAll bookings admin services', error) 
            return {
                success: false,
                message:'Fetching bookings failed'
            }
        }
    }

    async getAllDatas() {
        try {
            const users = await User.find()
            const hostels = await Hostel.find()
            const bookings = await Booking.find()
            
            return {
                success: true,
                message: 'datas fetched',
                data:{users,hostels,bookings}
            }
        } catch (error) {
            console.log('Error from getAll datas admin services', error) 
            return {
                success: false,
                message:'Fetching bookings failed'
            }
        }
    }
    
}