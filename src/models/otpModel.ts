import mongoose from "mongoose";
import { OtpDoc } from "../interfaces/IOtp";

const { Schema } = mongoose


const OTP = new Schema<OtpDoc>({
    Email: String,
    Otp: String,
    CreatedAt: Date,
    ExpiresAt: Date
})


export default mongoose.model<OtpDoc>('Otp', OTP)