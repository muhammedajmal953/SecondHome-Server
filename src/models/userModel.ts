import mongoose from "mongoose";
import { UserDoc } from "../interfaces/IUser";

const { Schema } = mongoose;

const userSchema = new Schema<UserDoc>({
    First_name: String,
    Last_name: String,
    Email: String,
    Phone: Number,
    Password: String,
    IsAdmin: {
        type: Boolean,
        default: false
    },
    Role: String,
    Location: String,
    CreatedAt: {
        type: Date,
        default: new Date()
    },
    UpdatedAt: {
        type: Date,
        default: new Date()
    },
    Avatar: String,
    IsActive: {
        type: Boolean,
        default: true
    },
    Gender: String,
    isVerified: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model<UserDoc>('User', userSchema);

export default User;
