import { Document } from "mongoose";


export interface IWishlist extends Document {
    userId: string,
    hostels: {
        hostelId: string
        createdAt:Date
    }[]
}

