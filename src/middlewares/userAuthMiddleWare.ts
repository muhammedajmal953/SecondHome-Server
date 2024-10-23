import { Request,Response,NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


export const userAuth=(req: Request,res:Response,next:NextFunction)=>{
   
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(403).json({
                success: false,
                message:'Please login'
            })
        }

    try {
        const paylod = verifyToken(token)
        const decoded = (JSON.parse(JSON.stringify(paylod))).payload
  
        if (decoded.Role !== 'User' || !decoded.IsActive) {
            return res.status(401).json({
                success: false,
                message:'Access Denined'
            })
        }
        next()
        
    } catch (error:unknown) {
        if (error instanceof Error) {
            if (error.message === 'Token expired') {  
                return res.status(401).json({ message: 'Unauthorized: Token expired' });
            }
        }
        return res.status(403).json({ message: 'Forbidden: Invalid token' }); 
    }
}