import mongoose from "mongoose";
import { IWishlist } from "../interfaces/IWishlist";
import { ObjectId } from "mongodb";

const { Schema } = mongoose


 const wishlistModel = new Schema < IWishlist > ({
    userId: ObjectId,
    hostels: [{
        hostelId: ObjectId,
        createdAt: {
            type: Date,
            default:new Date()
        }
     }]
    
})


export const Wishlist =mongoose.model<IWishlist>('Wishlist',wishlistModel)