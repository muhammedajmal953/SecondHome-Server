import mongoose, { Schema } from "mongoose";
import { IChat } from "../interfaces/IChat";


const chat = new Schema<IChat>({
    roomId:String,
    vendorId: String,
    userId:String,
    messages: [{
        sender: String,
        time: {
            type: Date,
            default:new Date()
        },
        content:String
    }]
})

export const Chat=mongoose.model<IChat>('Chat',chat)