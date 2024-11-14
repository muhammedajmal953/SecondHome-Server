import { IUserRepository } from "../interfaces/IRepositories";
import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDoc> implements IUserRepository{

    constructor() {
        super(User)
    }

    async getUserByEmail(email: string): Promise<UserDoc | null> {
        try {
            return await User.findOne({ Email: email });
        } catch (error) {
            console.error("Error fetching user by email:", error);
            throw new Error("Could not fetch user by email");
        }
    }

   async getAllUsers() {
        return User.find()
    }
    
}

export default UserRepository 