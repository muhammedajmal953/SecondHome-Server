import { Document } from "mongoose"


export interface OtpDoc extends Document{
    Email: string
    Otp: string
    CreatedAt: Date
    ExpiresAt: Date
    isUpdated: boolean
} 

