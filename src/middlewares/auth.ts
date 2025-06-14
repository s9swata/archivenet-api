import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    try{
        if (!token || process.env.CLERK_JWT_KEY === undefined) {
            res.status(401).json({
                message: "erorr while decoding jwt, token is missing or clerk jwt key is not set"
            });
            return;
        }
        const decoded = jwt.verify(token, process.env.CLERK_JWT_KEY, {
            algorithms: ['RS256']
        }) as JwtPayload;
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