import { Request,Response,NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { Role, Status } from "../utils/enums";


export const adminAuth=(req: Request,res:Response,next:NextFunction)=>{
   
        const token = req.headers.authorization?.split(' ')[1]
       //access denined if not token available
        if (!token) {
            return res.status(Status.FORBIDDEN).json({
                success: false,
                message:'Please login'
            })
        }

    try {
        const paylod = verifyToken(token)
        const decoded=(JSON.parse(JSON.stringify(paylod)).payload)
       
        if (decoded.Role !== Role.Admin) {
            return res.status(Status.UN_AUTHORISED).json({
                success: false,
                message:'Please login'
            })
        }
        next()
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Token expired') {  
                return res.status(Status.UN_AUTHORISED).json({ message: 'Unauthorized: Token expired' });
            }
        }
        return res.status(Status.FORBIDDEN).json({ message: 'Please login' }); 
    }    
}

