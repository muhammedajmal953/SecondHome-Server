import mongoose from "mongoose";
import { IHostel } from "../interfaces/IHostel";
import { ObjectId } from "mongodb";

const HostelModel = new mongoose.Schema<IHostel>({
    name: String,
    address: {
        street: String,
        city: String,
        district: String,
        state: String,
        pincode: Number,
        latitude: Number,
        longtitude:Number
    },
    phone: String,
    email: String,
    description: String,
    facilities: [String],
    policies: String,
    nearbyPlaces: [String],
    photos: [String], 
    rates: [
        {
            type: { type: String, required: true },
            price: { type: Number, required: true },
            quantity:{type:Number}
        }
    ],
    foodRate: Number,
    createdAt: {
        type: Date, 
        default:new Date
    },
    updatedAt: {
        type: Date,
        default:new Date
    },
    isDeleted: Boolean,
    isActive: {
        type: Boolean,
        default:true
    },
    category: String,
    owner: ObjectId,
    advance:Number
})

const Hostel= mongoose.model<IHostel>("Hostel", HostelModel)
export default Hostel

