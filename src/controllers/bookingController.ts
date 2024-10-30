import { Request, Response } from "express";
import { BookingService } from "../services/bookingServices";
import { Status } from "../utils/enums";



export class BookingController {
    constructor(private _bookingService: BookingService) { }
    
    async createOrder(req: Request, res: Response) {
        try {
            const data = req.body
            
            console.log('fromUserData',data);

            const result = await this._bookingService.createOrder(data)
            
            if (!result.data) {
                return res.status(Status.UN_AUTHORISED).json(result)
            }
           
            return res.status(Status.CREATED).json(result)
        } catch (error) {
            console.log(error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:'Internal Server error'
            })
        }
    }

    async saveBooking(req: Request, res: Response) {
        try {
            const data = req.body

            if (!data) {
                return res.status(Status.BAD_REQUEST).json({
                    success: false,
                    message:'Bad Request'
                })
            }
            
            const result = await this._bookingService.saveBooking(data)
            
            if (!result.success) {
                return res.status(Status.BAD_GATEWAY).json(result)
            }

            return res.status(Status.CREATED).json(result)
        } catch (error) {
           console.log(error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:'Internal Sever error'
            })
        }
    }

    async getAllbokings(req: Request, res: Response) {
       try {
        const bearer = req.headers.authorization!;
           const token = bearer.split(" ")[1];
           
           const {page}=req.params

           const result = await this._bookingService.getAllBookings(Number(page), token)
           
           return res.status(Status.OK).json(result)
       } catch (error) {
         console.log(error);
           return res.status(Status.INTERNAL_SERVER_ERROR).json({message:'internal server error'})
       }
    }
    async cancelBooking(req: Request, res: Response) {
        try {
            const { reason } = req.body
            const { id } = req.query
            
            const result = await this._bookingService.cancelBooking(reason, id as string)

            if (!result?.success) {
                return res.status(Status.BAD_REQUEST).json(result)
            }

            return res.status(Status.OK).json(result)
        } catch (error) {
            console.log('Error from the cancel Hostel booking Controller',error);
            
        }
    }
}   