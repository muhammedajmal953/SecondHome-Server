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

    updateOtp(email: string,otp:string): Promise<OtpDoc | null> {
        return otpModel.findOneAndUpdate({ Email: email },{Otp:otp,ExpiresAt:new Date(Date.now()+600000)},{new:true}) 
    }
}

export default OtpRepository