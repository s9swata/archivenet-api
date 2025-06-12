import express from 'express';
import { auth } from '../middlewares/auth';
import { generateApiKey } from '../utils/apiKey';
import { db } from '../database/db';
import { apiKeyTable } from '../database/schemas/apiKey';
import { createApiKey, deleteApiKey, listApiKeys,  } from '../database/models/ApiKey';
import { eq, and } from 'drizzle-orm';

export const apiKeyRouter = express.Router();

apiKeyRouter.post('/create', auth, async (req, res) => {
    const userId = req.userId;
    const name = req.body.name || 'Default API Key';
    const description = req.body.description || 'API Key for ArchiveNet';
    
    const key = generateApiKey(userId);
    if (!key) {
        return res.status(500).json({ error: 'Failed to generate API Key' });
    }
    const apiKey = key.apiKey; // Not stored in db
    const keyHash = key.hashedKey;
    const keyId = key.keyId;
    try{
        const createdApiKey = await createApiKey(userId, keyHash, name, description, keyId);
        if (!createdApiKey) {
            return res.status(500).json({ error: 'Failed to create API Key in database' });
        }
    
        return(res.status(201).json({
            message: 'API Key created successfully',
            apiKey: {
                key: apiKey,
                keyPrefix: key.keyPrefix,
            }
        }));
    } catch (error) {
        console.error('Error creating API Key:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }  
})

apiKeyRouter.get('/list', auth, async (req, res) => {
    const userId = req.userId;

    try {
        const apiKeys = await listApiKeys(userId);
        if (apiKeys.length === 0) {
            return res.status(404).json({ error: 'No API Keys found for this user' });
        }
        return res.status(200).json(apiKeys);
    } catch (error) {
        console.error('Error fetching API Keys:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

apiKeyRouter.put('/update/:id', auth, async (req, res) => {
    const userId = req.userId;
    const apiKeyId = req.params.id;
    const updates = req.body;

    try {
        const updatedApiKey = await db.update(apiKeyTable)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(and(eq(apiKeyTable.userId, userId), eq(apiKeyTable.id, apiKeyId)))
            .returning();

        if (!updatedApiKey) {
            return res.status(404).json({ error: 'API Key not found or already deleted' });
        }
        return res.status(200).json(updatedApiKey);
    } catch (error) {
        console.error('Error updating API Key:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

