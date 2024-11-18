

import { IWishlist } from "../interfaces/IWishlist";
import { Wishlist } from "../models/wishlistModel";
import { BaseRepository } from "./baseRepository";

export class WishlistRepository
  extends BaseRepository<IWishlist>
{
  constructor() {
    super(Wishlist);
  }

}
