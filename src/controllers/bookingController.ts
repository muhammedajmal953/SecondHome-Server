import { Request, Response } from "express";
import { BookingService } from "../services/bookingServices";
import { Status } from "../utils/enums";



export class BookingController {
    constructor(private _bookingService: BookingService) { }
    
    async createOrder(req: Request, res: Response) {
        try {
            const data = req.body
            
            const bearer = req.headers.authorization!;

            if (!bearer) {
              return res
              .status(Status.UN_AUTHORISED).json({
                success: false,
                message: "Unauthorized: No token provided",
              })
            }
      
            const token = bearer.split(" ")[1];

            const result = await this._bookingService.createOrder(data,token)
            
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
            res.status(Status.INTERNAL_SERVER_ERROR).json('internal server error')
        }
    } 

    async getBooking(req: Request, res: Response) {
        try {
            const { id } = req.params
            
            const result = await this._bookingService.getBookingWithHostel(id)
            
            if (!result || !result.success) {
               return res.status(Status.NOT_FOUND).json(result)
            }
            return res.status(Status.OK).json(result)
        } catch (error) {
            console.log('Error from the get Hostel booking Controller',error);
            res.status(Status.INTERNAL_SERVER_ERROR).json('internal server error')
        }
    }
}   