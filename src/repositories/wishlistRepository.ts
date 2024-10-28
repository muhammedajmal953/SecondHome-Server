import { UpdateWriteOpResult } from "mongoose";
import { IWishlistRepository } from "../interfaces/IRepositories";
import { IWishlist } from "../interfaces/IWishlist";
import { Wishlist } from "../models/wishlistModel";
import { BaseRepository } from "./baseRepository";

export class WishlistRepository
  extends BaseRepository<IWishlist>
  implements IWishlistRepository
{
  constructor() {
    super(Wishlist);
  }

  async getWishlistByUserId(id: string): Promise<IWishlist | null> {
    try {
      return Wishlist.findOne({ userId: id });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

   async removeFromWishList(userId: string, hostelId:string): Promise<UpdateWriteOpResult|null>{
      try {
        return Wishlist.updateOne({userId},{$pull:{hostels:{hostelId}}})
      } catch (error) {
        console.log(error);
        return null
      }
  }
}
