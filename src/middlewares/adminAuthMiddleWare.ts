import { Request,Response,NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


export const adminAuth=(req: Request,res:Response,next:NextFunction)=>{
   
        const token = req.headers.authorization?.split(' ')[1]
       //access denined if not token available
        if (!token) {
            return res.status(403).json({
                success: false,
                message:'Please login'
            })
        }

    try {
        const paylod = verifyToken(token)
        const decoded=(JSON.parse(JSON.stringify(paylod)).payload)
       
        if (decoded.Role !== 'Admin') {
            return res.status(401).json({
                success: false,
                message:'You are not an Admin'
            })
        }
        next()
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Token expired') {  
                return res.status(401).json({ message: 'Unauthorized: Token expired' });
            }
        }
        return res.status(403).json({ message: 'Forbidden: Invalid token' }); 
    }
    
}