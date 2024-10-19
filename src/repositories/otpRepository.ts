import otpModel from "../models/otpModel";
import { OtpDoc } from "../interfaces/IOtp";
import { BaseRepository } from "./baseRepository";


class OtpRepository extends BaseRepository<OtpDoc>{ 
    constructor() {
        super(otpModel)
    }
    getOtpByEmail(email: string): Promise<OtpDoc | null> {
        console.log('reach the repo');
        return otpModel.findOne({ Email: email })
    }
}

export default OtpRepository