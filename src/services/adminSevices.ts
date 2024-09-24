import UserRepository from "../repositories/userRepository";
import { generateToken, verifyToken } from "../utils/jwt";
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
    
          console.log('Logging in admin:', admin);
          let values:string[]=Object.values(admin)
            console.log('Incoming password:', values[1]);
            console.log('Saved hash:', adminExist?.Password);
            
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
          const token = generateToken(adminExist._id);
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

  async  getAllUsers() {
      let users = await this.userRepository.getUsers()
      
      
        return {
            success: true,
            message: "Users fetched successfully",
            data: users,
        }
    }

    async blockUser(token: string) {
        
        
        let user = await this.userRepository.getUserById(token)
        
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
    async unBlockUser(token: string) {
        let user = await this.userRepository.getUserById(token)
        
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
}