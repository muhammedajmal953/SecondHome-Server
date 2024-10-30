import { Document } from "mongoose";


export interface IWallet extends Document{
    userId: string,
    WalletBalance: number,
    transaction: {
        type: 'debit'|'credit',
        from: string
        amount: number
        description:string
    }[]
}