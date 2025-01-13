import { errorHandler } from "./error.js";
import jwt from 'jsonwebtoken';

export const verifyToken =(req,res,next)=>{
    const token =req.cookies.access_token;
    // console.log(access_token)
    if(!token){
        return next(errorHandler(401,'you are not authorized'))
    }
    jwt.verify(token,process.env.JWT_SECRET, (err,user)=>{
        if(err)return next(errorHandler(403,'forbidden'));
        // console.log(user)
        req.user =user
        next();
    })
}