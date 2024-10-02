
import jwt from "jsonwebtoken";


const secret = process.env.JWT_Secret!;

export const generateToken = (payload: any) => {

    let exp = Math.floor(Date.now() / 1000 )+ (24 * 60 * 60);
    
    return jwt.sign({ payload: payload },secret,{expiresIn: "7d"});
};

export const generateRefreshToken = (payload: any) => {
    let exp = Math.floor(Date.now() / 1000) + (7* 24 * 60 * 60)
    return  jwt.sign({payload:payload,exp}, secret, { expiresIn: "7d" }); 
};

export const verifyToken = (token: string) => {
    return  jwt.verify(token, secret);
}


