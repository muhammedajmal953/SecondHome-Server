
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