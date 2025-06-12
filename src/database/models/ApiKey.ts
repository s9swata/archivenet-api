import { db } from '../db';
import { apiKeyTable } from '../schemas/apiKey';
import { eq, and } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

type ApiKey = InferSelectModel<typeof apiKeyTable>;

export async function getApiKeyByUserId(userId: string): Promise<ApiKey | undefined> {
    const result = await db.query.apiKeyTable.findFirst({
        where: eq(apiKeyTable.userId, userId),
    });
    return result;
}

export async function createApiKey(
    userId: string,
    keyHash: string,
    name: string,
    description: string,
    keyId: string,
): Promise<any> { // #TODO: Replace 'any' with the actual return type
    const apiKey = await db.insert(apiKeyTable).values({
        userId,
        keyId,
        keyHash,
        name,
        description,
        contract_tx_id: '',
        arweave_wallet_address: '',
    }).returning();
    return apiKey;
}

export async function updateApiKey(
    userId: string,
    updates: Partial<Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'keyHash' | 'keyId'>>,
): Promise<ApiKey | undefined> {
    const [updatedApiKey] = await db.update(apiKeyTable)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(eq(apiKeyTable.userId, userId))
        .returning();

    return updatedApiKey;
}

export async function findHashedKeyInDb(keyHash: string): Promise<ApiKey | undefined> {
    const result = await db.query.apiKeyTable.findFirst({
        where: eq(apiKeyTable.keyHash, keyHash),
    });
    return result;
}

export async function deleteApiKey(userId: string, id: string): Promise<void> {
    await db.delete(apiKeyTable)
        .where(and(eq(apiKeyTable.userId, userId), eq(apiKeyTable.id, id)));
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
    const apiKeys = await db.query.apiKeyTable.findMany({
        where: eq(apiKeyTable.userId, userId),
    });
    return apiKeys;
}