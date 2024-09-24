import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";

class UserRepository {
    async createUser(user: UserDoc): Promise<UserDoc> {
        console.log('reach the repo');
        
        const newUser = new User(user);
        return newUser.save();
    }
    
    async getUsers(): Promise<any[]> {
        return User.find({IsAdmin: false});
    }
    async getUserByEmail(email:String): Promise<UserDoc | null> {
        return User.findOne({ Email: email });
    }

    async getUserById(id: String): Promise<UserDoc | null> {
        return User.findById(id);
    }
    
    async updateUser(id:string,updates:UserDoc): Promise<UserDoc | null> {
        return User.findByIdAndUpdate({_id:id},{$set:updates},{new:true});
    }
    
}

export default UserRepository