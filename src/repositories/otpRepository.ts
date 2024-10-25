import otpModel from "../models/otpModel";
import { OtpDoc } from "../interfaces/IOtp";
import { BaseRepository } from "./baseRepository";
import { IOtpRepository } from "../interfaces/IRepositories";


class OtpRepository extends BaseRepository<OtpDoc> implements IOtpRepository{ 
    constructor() {
        super(otpModel)
    }
    async getOtpByEmail(email: string): Promise<OtpDoc | null> {
        try {
            console.log('Reached the repository');
            return await otpModel.findOne({ Email: email });
        } catch (error) {
            console.error("Error fetching OTP by email:", error);
            throw new Error("Could not fetch OTP by email");
        }
    }
    
}

export default OtpRepository