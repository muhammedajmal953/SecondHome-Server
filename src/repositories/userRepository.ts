import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";

class UserRepository {
    async createUser(user: UserDoc): Promise<UserDoc> {
        console.log('reach the repo');
        
        const newUser = new User(user);
        return newUser.save();
    }
    
    async getUserByEmail(email:String): Promise<UserDoc | null> {
        return User.findOne({ Email: email });
    }

    async getUserById(id: String): Promise<UserDoc | null> {
        return User.findById(id);
    }

    
}

export default UserRepository