import { Request, Response } from "express";
import { WishlistServices } from "../services/wishlistServises";
import { verifyToken } from "../utils/jwt";
import { Status } from "../utils/enums";

export class WishlistController {
  constructor(private _wishlistServices: WishlistServices) {}

  async addToWishlist(req: Request, res: Response) {
    try {
      const { id } = req.body;

        const token = req.headers.authorization?.split(" ")[1];
    

      if (!token) {
        console.log("User token not provided");
        return res
          .status(Status.UN_AUTHORISED)
          .json({ message: "Unautherised:no access token provided" });
      }

        const payload = verifyToken(token!); 
        
 
        

        const userId = (JSON.parse(JSON.stringify(payload)).payload)._id;
        
        console.log(userId);
        

      const result = await this._wishlistServices.addToWish(userId, id);

      if (!result || !result.success) {
        return res.status(Status.INTERNAL_SERVER_ERROR).json(result);
      }

      return res.status(Status.CREATED).json(result);
    } catch (error) {
      console.error("Error in wishlishController.addToWishList", error);

      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "add to wishlist failed",
      });
    }
  }

  async getAllWishlist(req: Request, res: Response) {
    try {
      const { page } = req.params;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        console.log("User token not provided");
        return res
          .status(Status.UN_AUTHORISED)
          .json({ message: "Unautherised:no access token provided" });
      }

      const payload = verifyToken(token!);

      const userId = JSON.parse(JSON.stringify(payload)).payload._id;

        const result = await this._wishlistServices.getAllWishList(Number(page), userId)
        
        if (!result || !result.success) {
            return res.status(Status.NOT_FOUND).json(result)
        }

        return res.status(Status.OK).json(result)
    } catch (error) {
        console.error("Error in wishlishController.getAllWishlist", error);

      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "fetch wish list failed",
      });
    }
    }
    
    async removeWishlist(req: Request, res: Response) {
        try {
            const { id } = req.body;

            const token = req.headers.authorization?.split(" ")[1];
      
            if (!token) {
              console.log("User token not provided");
              return res
                .status(Status.UN_AUTHORISED)
                .json({ message: "Unautherised:no access token provided" });
            } 
      
            const payload = verifyToken(token!);
      
            const userId = JSON.parse(JSON.stringify(payload)).payload._id;
            const result = await this._wishlistServices.removeFromWishList(userId, id)
            
            if (!result || !result.success) {
                return res.status(Status.NOT_FOUND).json(result)
            }
    
            return res.status(Status.OK).json(result)
        } catch (error) {
            console.error("Error in wishlishController.removeWishlist", error);

            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "add to wishlist failed",
            });
        }
    }
}
