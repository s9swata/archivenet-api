import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export interface ApiKeyPayload {
    keyId: string;
    userId: string;
    createdAt: number;
}

export interface ApiKeyResult {
    keyId: string;
    token: string;
    keyPrefix: string;
}

export const generateApiKey = (
    userId: string, 
): ApiKeyResult => {
    // Generate unique key ID
    const keyId = `ak_${crypto.randomBytes(8).toString('hex')}`;
    
    const payload: ApiKeyPayload = {
        keyId,
        userId,
        createdAt: Date.now(),
    };
    
    // Generate JWT token
    const token = jwt.sign(payload, JWT_SECRET, {
        issuer: 'archivenet-api',
        audience: 'archivenet-users'
    });
    
    // Create display prefix
    const keyPrefix = `${keyId}...`;
    
    return {
        keyId,
        token,
        keyPrefix
    };
};

export const verifyApiKey = (token: string): ApiKeyPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'archivenet-api',
            audience: 'archivenet-users'
        }) as ApiKeyPayload;
        
        return decoded;
    } catch (error) {
        // Token is invalid, expired, or malformed
        return null;
    }
};

export const decodeApiKey = (token: string): ApiKeyPayload | null => {
    try {
        // Decode without verification (useful for getting keyId for database lookup)
        const decoded = jwt.decode(token) as ApiKeyPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

export const refreshApiKey = (currentToken: string, newExpirationDays?: number): ApiKeyResult | null => {
    const decoded = verifyApiKey(currentToken);
    if (!decoded) return null;
    
    // Generate new token with same payload but updated timestamps
    return generateApiKey(decoded.userId);
};

// Utility to extract user ID from token without full verification
export const extractUserIdFromToken = (token: string): string | null => {
    const decoded = decodeApiKey(token);
    return decoded?.userId || null;
};