import {Request,Response} from 'express'
import jwt from 'jsonwebtoken'
const authMiddleware = async (req : Request,res:Response,next)=>{
    const authHeader:string = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(403).json({
            msg : "not authorized"
        })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decoded =  jwt.verify(token,process.env.JWT_SECRET_KEY as string);
        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(403).json({masg : "internal server error"});
    }
}
export {authMiddleware}