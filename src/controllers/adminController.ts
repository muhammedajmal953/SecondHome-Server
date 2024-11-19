import { Request, Response } from "express";
import { AdminServices } from "../services/adminSevices";
import { Status } from "../utils/enums";

export class AdminController {
  constructor(private _adminService: AdminServices) {
    this._adminService = _adminService;
  }

  async loginAdmin(req: Request, res: Response) {
    try {
      const { data } = req.body;

      if (!data) {
        console.error("Login failed: 'data' is missing");
        return res
          .status(Status.BAD_REQUEST)
          .json({ success: false, message: "Data is required" });
      }

      const result = await this._adminService.loginUser(data);

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error("Error during admin login:", error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { page, limit } = req.params;
      const newPage = Number(page) || 1;
      const newLimit = Number(limit) || 10;
      const { searchQuery } = req.query;
      const name = searchQuery as string;

      const result = await this._adminService.getAllUsers(
        name,
        newPage,
        newLimit
      );

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getAllVendors(req: Request, res: Response) {
    try {
      const { page, limit } = req.params;
      const newPage = Number(page) || 1;
      const newLimit = Number(limit) || 10;

      const { searchQuery } = req.query;
      const name = searchQuery as string;

      const result = await this._adminService.getAllVendors(
        name,
        newPage,
        newLimit
      );

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return res.status(Status.NOT_FOUND).json({
        success: false,
        message: "Something went wrong",
        data: null,
      });
    }
  }

  async blockUser(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        console.error("Block user failed: 'token' is missing");
        return res
          .status(Status.BAD_REQUEST)
          .json({ success: false, message: "Token is required" });
      }

      const result = await this._adminService.blockUser(token);

      if (!result) {
        return res
          .status(Status.NOT_FOUND)
          .json({ success: false, message: "User not found" });
      }

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error("Error blocking user:", error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async unBlockUser(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        console.error("Unblock user failed: 'token' is missing");
        return res
          .status(Status.BAD_REQUEST)
          .json({ success: false, message: "Token is required" });
      }

      const result = await this._adminService.unBlockUser(token);

      if (!result) {
        return res
          .status(Status.NOT_FOUND)
          .json({ success: false, message: "User not found" });
      }

      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error("Error unblocking user:", error);
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async verifyVendor(req: Request, res: Response) {
    const { id } = req.body;

      try {
        
      if (!id) {
        return res
          .status(Status.BAD_REQUEST)
          .json({ success: false, message: "Id is required" });
        }
        
        const result = await this._adminService.verifyVendor(id);
        
      if (!result) {
        return res
          .status(Status.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        }
        
          return res.status(Status.OK).json(result);
          
      } catch (error) {
          
          console.error("error from verify vendor admin controller", error);
          
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
          
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.params;
      if (!refreshToken) {
        return res.status(Status.UN_AUTHORISED).json({
          message: "unautherised:no token provided",
        });
      }
      const result = this._adminService.refreshToken(refreshToken);
      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in VendorController.refreshToken:", error);
      if (error instanceof Error) {
        if (
          error.message === "Token expired" ||
          error.name === "Token verification failed"
        ) {
          res
            .status(Status.UN_AUTHORISED)
            .json({ message: "Unauthorized: Token expired" });
          return;
        }
      }
      res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
  }

  async getAllHostel(req: Request, res: Response) {
    try {
      const { searchQuery } = req.query;
      const { page } = req.params;
      const result = await this._adminService.getAllHostel(
        Number(page),
        searchQuery as string
      );
      return res.status(Status.OK).json(result);
    } catch (error) {
      console.error(error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server Error",
      });
    }
  }
  async getAllBooking(req: Request, res: Response) {
    try {
      const { page } = req.params
      
      const result = await this._adminService.getAllBookings(Number(page))
      
      if (!result || !result.success) {
        return res.status(Status.NOT_FOUND).json({message:'Bookings not found'})
      }

      return res.status(Status.OK).json(result)
    } catch (error) {
      console.log('Error adminController.getAllbooking', error)
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ message:'Internal Server Error'})
    }
  }

  async getAllDatas(req: Request, res: Response) {
    try {
      const result = await this._adminService.getAllDatas()
      
      return res.status(Status.OK).json(result)
    } catch (error) {
        console.log('Error adminController.getAllbooking', error)
      return res.status(Status.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' })
    }
  }
}
