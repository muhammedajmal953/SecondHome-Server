import { Request,Response,NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { Role, Status } from "../utils/enums";


export const userAuth=(req: Request,res:Response,next:NextFunction)=>{
   
    const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(Status.FORBIDDEN).json({
                success: false,
                message:'Please login'
            })
        }

    try {
        const paylod = verifyToken(token)
        const decoded = (JSON.parse(JSON.stringify(paylod))).payload
  
        if (decoded.Role !== Role.User || !decoded.IsActive) {
            return res.status(Status.UN_AUTHORISED).json({
                success: false,
                message:'Please login'
            })
        }
        next()
        
    } catch (error:unknown) {
        if (error instanceof Error) {
            if (error.message === 'Token expired') {  
                return res.status(Status.UN_AUTHORISED).json({ message: 'Unauthorized: Token expired' });
            }
        }
        return res.status(Status.FORBIDDEN).json({ message: 'Forbidden: Invalid token' }); 
    }
}

