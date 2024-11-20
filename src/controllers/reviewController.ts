import { Request, Response } from "express";
import { ReviewService } from "../services/reviewService";
import { Status } from "../utils/enums";

export class ReviewController{
    constructor(private _reviewService: ReviewService) { }
    
    async addReview(req:Request,res:Response) {
       try {
           const { id } = req.params
           const { userId } = req.query
           const { reviewData } = req.body

           if (!id||!userId) {
               return res.status(Status.BAD_GATEWAY).json({message:'Bad Gate Hostel'})
           }

           if (!reviewData) {
               return res.status(Status.BAD_REQUEST).json({message:'RevieData not Provided'})
           }
           
           const result = await this._reviewService.addReview(reviewData, userId as string, id)
           
           return res.status(Status.CREATED).json(result)
       } catch (error) {
            console.log('Error in review controller.addReview',error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({message:'Internal Server Error'})
       } 
    }

    async getReview(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(Status.BAD_GATEWAY).json({message:'Bad Gate Hostel'})
            }
            
            const result=await this._reviewService.getReview(id)
            
            return res.status(Status.OK).json(result)
        } catch (error) {
            console.log('Error in review controller.getReview',error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({message:'Internal Server Error'})
        }
    }
}