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
        pincode: Number
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
            price: { type: Number, required: true }
        }
    ],
    foodRate: Number,
    createdAt: Date,
    updatedAt: Date,
    isCompleted: Boolean,
    isActive: Boolean,
    catagory: String,
    owner: ObjectId,
    advance:Number
})

let Hostel= mongoose.model<IHostel>("Hostel", HostelModel)
export default Hostel

