import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";

class UserRepository {
    async createUser(user: UserDoc): Promise<UserDoc> {
        console.log('reach the repo');
        
        const newUser = new User(user);
        return newUser.save();
    }
    
    async getUsers(limit:number): Promise<any[]> {
        return User.find({IsAdmin: false,Role:'User'}).skip(limit).limit(5);
    }
    async getVendors(limit:number): Promise<any[]> {
        return User.find({IsAdmin: false,Role:'Vendor'}).skip(limit).limit(5);
    }
    async getUserByEmail(email:string): Promise<UserDoc | null> {
        return User.findOne({ Email: email }); 
    }

    async getUserById(id: String): Promise<UserDoc | null> {
        return User.findById(id);
    }
    
    async updateUser(id:string,updates:any): Promise<UserDoc | null> {
        return User.findByIdAndUpdate({_id:id},{$set:updates},{new:true});
    }
    async updateUserByEmail(email:string,updates:any): Promise<UserDoc | null> {
        return User.findOneAndUpdate({Email:email},{$set:updates},{new:true});
    }

    async uploadKyc(email:string,file:string): Promise<UserDoc | null> {
        return User.findOneAndUpdate({Email:email},{$set:{lisence:file}},{new:true});
    }

    async verifyKYC(id:string): Promise<UserDoc | null> {
        return User.findByIdAndUpdate({_id:id},{$set:{isKYCVerified:true}},{new:true});
    }
    
}

export default UserRepository