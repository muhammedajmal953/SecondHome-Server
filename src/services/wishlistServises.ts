import { IResponse } from "../interfaces/IResponse";
import { IWishlistService } from "../interfaces/IServices";
import { HostelRepository } from "../repositories/hostelRepository";
import { WishlistRepository } from "../repositories/wishlistRepository";

export class WishlistServices implements IWishlistService{
    
    constructor(private _wislistRepository: WishlistRepository,private _hostelRepository:HostelRepository) { }
   async addToWish(id: string,hostelId:string): Promise<IResponse> {
        try {
            const existingWishlist = await this._wislistRepository.getWishlistByUserId(id)
            
            if (existingWishlist) {

                const existingHostel = existingWishlist.hostels
                
                existingHostel.forEach(hostel => {
                    if (hostel.hostelId === hostelId) {
                        return {
                            success: true,
                            message:'Added to wishlist'
                        }
                   }
               })
                
                await this._wislistRepository.update(existingWishlist._id as string, { $addToSet: { hostels: {hostelId} } }) 
                
                return {
                    success: true,
                    message:'Added to wishlist'
                }
            }
            
            const wishlist: { userId: string, hostels: { hostelId: string, createdAt: Date }[] } = {
                userId: id,
                hostels: [{
                    hostelId,
                    createdAt:new Date()
                }]
            }       

            await this._wislistRepository.create(wishlist)

            return {
                success: true,
                message:'Added to wishlist'
            }
        } catch (error) {
            console.log('Error from Add to wishlist services ',error);
            return {
                success: false,
                message: 'Add to wishlish failed'
            }
        }
    }

    async getAllWishList(page: number, id: string): Promise<IResponse> {
        try {
            const wishlist = await this._wislistRepository.getWishlistByUserId(id)
            
            if (!wishlist) {
                return {
                    success: false,
                    message:'No Wishlist founded'
                }
            }

            const hostelIds = wishlist.hostels.sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime()).map(hostel=>hostel.hostelId)
            
            const skip=(page-1)*5
            const hostels =await this._hostelRepository.findAll({ _id: { $in: hostelIds } }, skip)
            return {
                success: true,
                message: 'Wishlisted Hostels',
                data:hostels
            }
        } catch (error) {
            console.error('Error from Hostel Woshlist Services',error);
            return{
                success: false,
                message:'Falied to fetch WishList'
            }
        }

    }
    async removeFromWishList(id: string,hostelId:string): Promise<IResponse> {
        try {
            const remove = await this._wislistRepository.removeFromWishList(id, hostelId) 
            if (!remove) {
                return {
                    success: false,
                    message:'Remove Hostel is Failed'
                }

            }
            return {
                success: true,
                message:'Hostel Remove from WishList successfully'
            }
        } catch (error) {
            console.log('Error in Wishlist Remove service',error);
            return {
                success: false,
                message:'Hostel Remove failed'
            }
        }
    }  
}   