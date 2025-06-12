import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    try{
        const decoded = jwt.decode(token, process.env.CLERK_JWT_KEY, {
            algorithms: ['RS256']
        })
        if (decoded?.sub){
            req.userId = decoded?.sub;
            next()
        }
    }
    catch(e){
        res.status(403).json({
            message: "Error while decoding jwt"
        })
        
    }
} 