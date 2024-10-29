import { Request, Response } from "express";
import { BookingService } from "../services/bookingServices";



export class BookingController {
    constructor(private _bookingService: BookingService) { }
    
    async createOrder(req: Request, res: Response) {
        try {
            const data = req.body
            
            console.log('fromUserData',data);


            const result = await this._bookingService.createOrder(data)
            
           
            return res
        } catch (error) {
            console.log(error);
            
        }
    }

    async saveBooking(req: Request, res: Response) {
        try {
            const data = req.body

            console.log(data);
            

            return res
        } catch (error) {
           console.log(error);
            
        }
    }
}   