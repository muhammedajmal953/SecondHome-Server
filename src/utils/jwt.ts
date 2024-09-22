
import jwt from "jsonwebtoken";


const secret = process.env.JWT_Secret!;

export const generateToken = (payload: any) => {
    
    return  jwt.sign({payload:payload}, secret, { expiresIn: "1d" });
};

const generateRefreshToken = (payload: any) => {
    return  jwt.sign({payload:payload}, secret, { expiresIn: "7d" });
};

const verifyToken = (token: string) => {
    return  jwt.verify(token, secret);
}


module.exports= {verifyToken, generateToken, generateRefreshToken }