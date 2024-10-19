import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDoc>{

    constructor() {
        super(User)
    }

    async getUserByEmail(email:string): Promise<UserDoc | null> {
        return User.findOne({ Email: email }); 
    }
  
}

export default UserRepository