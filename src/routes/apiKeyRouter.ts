import express from 'express';
import crypto from 'crypto';
import { db } from '../database/db';
import { apiKeyTable } from '../database/schemas/apiKey';
import { auth } from '../middlewares/auth';

export const apiKeyRouter = express.Router();

apiKeyRouter.post('/create', auth, async (req, res) => {
    const userId = req.userId;
    const name = req.body.name || 'Default API Key';
    const description = req.body.description || 'API Key for ArchiveNet';
    const contract_tx_id = req.body.contract_tx_id; // This should be set after Arweave contract creation
    const keyHash = crypto.randomBytes(32).toString('hex'); // did not implement the jwt method
    
    const apiKeyEntry = await db.insert(apiKeyTable).values({
        userId,
        keyHash,
        name,
        description,
        contract_tx_id, // Placeholder, should be set after Arweave contract creation
        arweave_wallet_address: '', // Placeholder, should be set after wallet setup
        isActive: false,
        lastUsedAt: null, // Initially null, will be updated on first use
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();
    console.log('Request Body:', req.body);
    console.log('API Key created:', apiKeyEntry);
    res.status(201).json({
        message: 'API Key created successfully',
        apiKey: {
            keyHash
        }
    });
})