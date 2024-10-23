import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDoc>{

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
    
}

export default UserRepository