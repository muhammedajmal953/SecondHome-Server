import { Request, Response } from "express";
import { HostelService } from "../services/hostelService";

export class HostelController {
   

  constructor( private _hostelService: HostelService) {
    this._hostelService = _hostelService;
  }

  async createHostel(req: Request, res: Response) {
    try {
      const photos = req.files as Express.Multer.File[];
      const bearer = req.headers.authorization!;
      const token = bearer.split(" ")[1];
      const formdata = req.body;

      if (!formdata) {
        return res.status(500).json({
          success: false,
          message: "no data found",
        });
      }

      const result = await this._hostelService.createHostel(
        photos,
        formdata,
        token
      );

      if (!result) {
        return res.status(500).json({
          sucess: false,
          message: "internal server error",
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Internal server Error",
      });
    }
  }

  async getAllHostel(req: Request, res: Response) {
    try {
      const { searchQuery } = req.query;
      const { page } = req.params;
      const result = await this._hostelService.getAllHostel(
        Number(page),
        searchQuery as string
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server Error",
      });
    }
  }

  async blockHostel(req: Request, res: Response) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(401).json({
          message: "Unautherised:unable to block Hostel",
        });
      }

      const result = await this._hostelService.blockHostel(id);

      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("Error in admin constroller block Hostel", error);
      return res.status(500).json({
        success: false,
        message: error,
      });
    }
  }

  async unBlockHostel(req: Request, res: Response) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(401).json({
          message: "Unautherised:unable to block Hostel",
        });
      }

      const result = await this._hostelService.unBlockHostel(id);

      return res.status(200).json(result);
    } catch (error: unknown) {
      console.error("Error in admin constroller block Hostel", error);
      return res.status(500).json({
        success: false,
        message: error
      });
    }
  }


  async getHostel(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await this._hostelService.getHostel(id)
      return res.status(200).json(result)
    } catch (error) {
      console.error('Error from the Hostelcontroller.GetHostel',error);
    }
  }

  async getHostelWithOwner(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await this._hostelService.getHostelWithOwner(id)
      return res.status(200).json(result)
    } catch (error) {
      console.error('Error from the Hostelcontroller.GetHostel',error);
    }
  }

  async editHostel(req: Request, res: Response) {
    try {
      const { id } = req.params
      

      const photos = req.files as Express.Multer.File[];
      const formdata = req.body;

      if (!formdata) {
        return res.status(500).json({
          success: false,
          message: "no data found",
        });
     }

      const result = await this._hostelService.editHostle(id, photos, formdata)
      
      return res.status(200).json(result)
   } catch (error) {
    console.error('Error from the hostel.Controller.editHostel',error);
    
   }
 }
}
 