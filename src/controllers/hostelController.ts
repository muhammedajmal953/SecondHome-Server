import { Request, Response } from "express";
import { HostelService } from "../services/hostelService";

export class HostelController { 
    private hostelService: HostelService;

    constructor(hostelService: HostelService) {
        this.hostelService = hostelService;
    }


    async createHostel(req: Request, res: Response) {
        try {
            let photos = req.files as Express.Multer.File[]
        let bearer = req.headers.authorization!
        let token=bearer.split(' ')[1]
        let formdata  = req.body
        
        if (!formdata) {
            return res.status(500).json({
                success: false,
                message:'no data found'
            })
        }

        const result = await this.hostelService.createHostel(photos, formdata, token)
        
        if (!result) {
            return res.status(500).json({
                sucess: false,
                message: 'internal server error'
            })
        }

        return res.status(200).json(result)

        } catch (error) {
            console.log(error);
            
            return res.status(500).json( {
                success: false,
                message: 'Internal server Error'
            })
        }
    }

    async getAllHostel(req: Request, res: Response) {
        try {
           
            const result =await this.hostelService.getAllHostel()
           return res.status(200).json(result)
        } catch (error) {
            console.error(error);
            return res.status(500).json( {
                success: false,
                message: 'Internal server Error'
            })
        }
    }
}