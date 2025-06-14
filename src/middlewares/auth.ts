import jwt, { type JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import type { Request, Response, NextFunction } from "express";

const client = jwksClient({
    jwksUri: process.env.CLERK_JWKS_URI || "",
});

function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, function (err, key) {
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err || !decoded || typeof decoded === "string") {
            return res.status(403).json({ message: "JWT verification failed" });
        }
        (req as any).userId = (decoded as JwtPayload).sub;
        next();
    });
};
