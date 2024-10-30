import mongoose from "mongoose";
import { IWallet } from "../interfaces/IWallet";


const { Schema } = mongoose

const walletSchema = new Schema<IWallet>({
    userId: String,
    WalletBalance: Number,
    transaction: [{
        type: {
            type:String,
            enum: ['debit', 'credit'],
        },
        from: String,
        amount: Number,
        description:String
    }]
})

export const Wallet=mongoose.model<IWallet>('Wallet',walletSchema)