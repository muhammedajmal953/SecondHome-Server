import { IOrder } from "../interfaces/IOrders";
import { IBookingRepository } from "../interfaces/IRepositories";
import { Booking } from "../models/bookingModels";
import { BaseRepository } from "./baseRepository";



export class BookingRepository extends BaseRepository<IOrder> implements IBookingRepository{
    constructor() {
        super(Booking)
    }
    
    async getOrderWithAllDetails(id: string): Promise<IOrder | null> {
        console.log(id);
        return  null
    }
    

}