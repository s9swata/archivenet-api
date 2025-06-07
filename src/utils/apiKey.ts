import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { findHashedKeyInDb } from '../database/models/ApiKey';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_ISSUER = 'archivenet-api';
const JWT_AUDIENCE = 'archivenet-users';

export interface ApiKeyPayload {
    /** Unique identifier of the API key */
    keyId: string;

    /** Associated user ID */
    userId: string;

    /** Timestamp of key creation */
    createdAt: number;
}

export interface ApiKeyResult {
    /** JWT token to be returned to user (only shown once) */
    apiKey: string;

    /** Unique key identifier */
    keyId: string;

    /** Short prefix version of key ID for display */
    keyPrefix: string;

    /** SHA-256 hash of the API token, to be stored in DB */
    hashedKey: string;
}
/**
 * Generates a new API key for the given user.
 *
 * - Creates a unique key ID.
 * - Signs a JWT token with the key ID and user ID.
 * - Hashes the token using SHA-256 for secure storage.
 *
 * @param userId - The user ID for whom the API key is being generated.
 * @returns ApiKeyResult - Contains the signed JWT token, key metadata, and hashed token.
 *
 *
 * Note: The `apiKey` field should be shown to the user only once.
 */
export const generateApiKey = (userId: string): ApiKeyResult => {
    const keyId = `ak_${crypto.randomBytes(8).toString('hex')}`;

    const payload: ApiKeyPayload = {
        keyId,
        userId,
        createdAt: Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    });

    // Hash token for secure DB storage
    const hashedKey = crypto.createHash('sha256').update(token).digest('hex');

    return {
        apiKey: token, // return this to the user only once
        keyId,
        keyPrefix: keyId.slice(0, 8),
        hashedKey,
    };
};

/**
 * Verifies an incoming API key.
 *
 * - Validates the JWT token signature and claims (issuer, audience).
 * - Hashes the token using SHA-256.
 * - Checks the hashed key against the database using the provided lookup function.
 *
 * @param token - The API token received from the client.
 * @param findHashedKeyInDb - An async function to look up the hashed token in the database.
 * @returns A promise resolving to the decoded ApiKeyPayload if valid, or null otherwise.
 */

export const verifyIncomingApiKey = (
    token: string,
): Promise<ApiKeyPayload | null> => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }) as ApiKeyPayload;

        const hashedKey = crypto.createHash('sha256').update(token).digest('hex');

        // Check in DB if this hashed key is active
        return findHashedKeyInDb(hashedKey).then(hashedKey => {
            if (!hashedKey) return null;
            return decoded;
        });
    } catch {
        return Promise.resolve(null);
    }
};
