
import jwt from "jsonwebtoken";


const secret = process.env.JWT_Secret!;

export const generateToken = (payload: unknown) => {
    console.log('rechead jwt');
    
    return jwt.sign({ payload: payload },secret,{expiresIn: "1d"});
};

export const generateRefreshToken = (payload: unknown) => { 
    return jwt.sign({ payload: payload },secret,{expiresIn: "7d"});
};

export const verifyToken = (token: string) => {
    return  jwt.verify(token, secret);
}


