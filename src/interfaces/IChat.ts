
import { UserDoc } from "./IUser"

export interface IChat{
    vendorId: string,
    userId: string,
    roomId:string,
    messages: {
        sender: string,
        time: Date,
        content:string
    },
}
export interface ChatDto{
    vendorId: string,
    userId: string,
    roomId:string,
    messages: {
        sender: string,
        time: Date,
        content:string
    },
    user: UserDoc|null
    vendor:UserDoc|null
}