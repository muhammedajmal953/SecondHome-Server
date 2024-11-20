
import { IReviewService } from "../interfaces/IServices";
import { ReviewRepository } from "../repositories/reviewRepository";


export class ReviewService implements IReviewService{
    constructor(private _reviewRepository:ReviewRepository) { }
    
    async addReview(reviewData: Record<string, unknown>, userId: string, hostelId: string){
        try {
         
            const { rating, review } = reviewData
         
            console.log('review details',rating,review);
            
         const exitstigReview = await this._reviewRepository.findByQuery({ hostelId })
         if (!exitstigReview) {
              await this._reviewRepository.create({
                 hostelId,
                 reviews: [{
                     review: review as string,
                     rating: rating as number,
                     userId: userId,
                     createdAt:new Date()
                 }]
             })
             const reviews=await this._reviewRepository.findByQuery({hostelId})
             return {
                 success: true,
                 message: 'review added',
                 data:reviews
             }
         }

        

         exitstigReview.reviews.push({
            review: review as string,
            rating: rating as number,
            userId: userId,
            createdAt:new Date()
         })

         await exitstigReview.save()

         return {
             success: true,
             message: 'review added',
             data:exitstigReview
         }
     } catch (error) {
        console.log('Error from reviewService',error);
         return {
             success: false,
             message:'Sorry No Reviews Found'
        }
     }
    }

    async getReview(hostelId: string) {
        try {
            const reviews = await this._reviewRepository.findByQuery({ hostelId })
            
            return {
                success: true,
                message: 'fetch hostels',
                data:reviews
            }
        } catch (error) {
            console.log('Error from reviewService.GetHostel',error);
            return {
                success: false,
                message:'Sorry No Reviews Found'
           }
        }
    }
}