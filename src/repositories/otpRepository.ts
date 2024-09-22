import otpModel from "../models/otpModel";
import { OtpDoc } from "../interfaces/IOtp";


class OtpRepository { 
    async createOtp(otp: OtpDoc): Promise<OtpDoc> {
        const newOtp = new otpModel(otp);
        return newOtp.save();
    }

    getOtpByEmail(email: string): Promise<OtpDoc | null> {
        console.log('reach the repo');
        
        return otpModel.findOne({ Email: email })
    }

    updateOtp(otp: OtpDoc): Promise<OtpDoc | null> {
        return otpModel.findOneAndUpdate({ Email: otp.Email }, otp, { new: true })
    }
}

export default OtpRepository