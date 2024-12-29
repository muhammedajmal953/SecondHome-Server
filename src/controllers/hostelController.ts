import { Request, Response } from "express";
import { HostelService } from "../services/hostelService";
import { Status } from "../utils/enums";



export class HostelController {
   
  constructor( private _hostelService: HostelService) {
    this._hostelService = _hostelService;
  }

  async createHostel(req: Request, res: Response) {
    try {
      const photos = req.files as Express.Multer.File[];
      const bearer = req.headers.authorization!;

      if (!bearer) {
        return res
        .status(Status.UN_AUTHORISED).json({
          success: false,
          message: "Unauthorized: No token provided",
        })
      }

      
      const token = bearer.split(" ")[1];
      const formdata = req.body;
      if (!formdata) {
        return res.status(Status.BAD_REQUEST).json({
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
        return res.status(Status.INTERNAL_SERVER_ERROR).json({
          sucess: false,
          message: "internal server error",
        });
      } 

      if (!result?.success) {
        console.error(result?.message)
        return res.status(Status.BAD_REQUEST).json(result)
      }

      return res.status(Status.CREATED).json(result);
    } catch (error) {
      console.log(error);

      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server Error",
      });
    }
  }

  async getAllHostel(req: Request, res: Response) {
    try {
    
      const { searchQuery, } = req.query;
      const{filter,sort}=req.body
      
      const { page } = req.params;
      const result= await this._hostelService.getAllHostel(
        Number(page),
        searchQuery as string,
        filter as Record<string,unknown>,
        sort as string
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

  async blockHostel(req: Request, res: Response) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(Status.BAD_REQUEST).json({
          message: "Unautherised:unable to block Hostel",
        });
      }

      const result = await this._hostelService.blockHostel(id);

      if (!result) {
        return res
            .status(Status.NOT_FOUND)
            .json({ success:false,message:'Hostel not found'})
    }

      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in admin constroller block Hostel", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error,
      });
    }
  }

  async unBlockHostel(req: Request, res: Response) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(Status.BAD_REQUEST).json({
          message: "Unautherised:unable to block Hostel",
        });
      }

      const result = await this._hostelService.unBlockHostel(id);
      if (!result) {
        return res
            .status(Status.NOT_FOUND)
            .json({ success:false,message:'Hostel not found'})
    }

      return res.status(Status.OK).json(result);
    } catch (error: unknown) {
      console.error("Error in admin constroller block Hostel", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error
      });
    }
  }


  async getHostel(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: "Hostel ID is required",
        });
      }

      const result = await this._hostelService.getHostel(id)

      if (!result) {
        return res.status(Status.NOT_FOUND).json({
          success: false,
          message: "Hostel ID is required",
        });
      }
      return res.status(Status.OK).json(result)
    } catch (error) {
      console.error('Error from the Hostelcontroller.GetHostel', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getHostelWithOwner(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return res
          .status(Status.BAD_REQUEST)
          .json({success:false,message:'Hostel id Required'})
      }

      console.log('id of the hostel',id);
      
      const result = await this._hostelService.getHostelWithOwner(id)

      if (!result) {
        return res
        .status(Status.NOT_FOUND)
      }

      return res.status(Status.OK).json(result)
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
        return res.status(Status.NOT_FOUND).json({
          success: false,
          message: "no data found",
        });
      }
      
      const result = await this._hostelService.editHostle(id, photos, formdata)

      if (!result || !result.success) {
        return res.status(Status.BAD_GATEWAY).json(result)
      }
      
      return res.status(Status.OK).json(result)
   } catch (error) {
    console.error('Error from the hostel.Controller.editHostel',error);
    return res.status(Status.INTERNAL_SERVER_ERROR).json({message:'internal server error'})
   }
 }
}
 