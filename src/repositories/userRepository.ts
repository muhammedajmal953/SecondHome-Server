
import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDoc>{

    constructor() {
        super(User)
    }
 
    
}

export default UserRepository  