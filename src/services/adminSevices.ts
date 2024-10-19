import UserRepository from "../repositories/userRepository";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import bcrypt from "bcryptjs";


export class AdminServices{
    constructor(private userRepository: UserRepository){}
    async loginUser(admin: any) {
        try { 
           
            
            const adminExist = await this.userRepository.getUserByEmail(admin.Email);
    
            if (!adminExist) {
                console.error("admin not found");
                return {
                    success: false,
                    message: "admin not found, please register",
                    data: null,
                };
            }
    
            //get elements from the object
            let values: string[] = Object.values(admin)
            
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
    
         
          
            if (adminExist.Role !== 'Admin'||!adminExist.IsAdmin) { 
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
      
        let newLimit = limit * (page - 1)
        let filter:any={ Role: 'User' }
        if (name) {
            filter['$or'] = [
                { First_name: { $regex: name, $options: 'i' } },
                {Email:{$regex:name,$options:'i'}},
            ]
        }
       
        let users = await this.userRepository.findAll(filter, newLimit)
        return {
            success: true,
            message: "Users fetched successfully",
            data: users,
        }
    }
    async getAllVendors(name:string,page: number, limit: number) {
      
        let newLimit = limit * (page - 1)
        let filter:any={ Role: 'Vendor' }
        if (name) {
            filter['$or'] = [
                { First_name: { $regex: name, $options: 'i' } },
                {Email:{$regex:name,$options:'i'}},
            ]
        }
        let users = await this.userRepository.findAll(filter, newLimit)
        
        return {
            success: true,
            message: "Users fetched successfully",
            data: users,
        } 
    }
    
    async blockUser(id: string) {
        let user = await this.userRepository.findById(id)
        
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
        let user = await this.userRepository.findById(id)
        
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
            let verification = await this.userRepository.update(_id,{isKYCVerified:true})

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
            
        }

    }

    async refreshToken(token:string) {
        try {
          let payload = verifyToken(token)
          const decoded = JSON.parse(JSON.stringify(payload)).payload
          
          const userData = await this.userRepository.findById(decoded._id)
          
          if (!userData) return { success: false, message: 'Admin Not found' }
          if (!userData.IsAdmin) throw new Error("Token verification failed")
          
          const accessToken =generateToken(userData)
          const refreshToken = generateToken(userData)
          
          return{ success:true,message:'Token refreshed successfully',data:{accessToken,refreshToken}}
        } catch (error) {
          console.error("Error in refreshToken:", error);
          throw error;
        }
      } 
}