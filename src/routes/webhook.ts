import express from 'express';
import { userTable } from '../database/schemas/user';
import { userSubscriptionTable } from '../database/schemas/subscriptions';
import { db } from '../database/db';

export const webhook = express.Router();

webhook.post('/user/registered', async (req, res) => {
    const userData = req.body.data;
    const email = userData.email_addresses?.[0]?.email_address;
    const username = userData.username || email;
    const fullName = `${userData.first_name} ${userData.last_name}`;
    const clerkId = userData.id;

    const user = await db.insert(userTable).values({
        username,
        email,
        fullName,
        clerkId,
        metaMaskWalletAddress: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();
    console.log('User registered:', user);
    res.status(200).json({message: 'User registration received'});
})

webhook.post('/user/payments/web3', async (req, res) => {
    const txnId = req.body.data.transactionId;
    const userId = req.body.data.userId;
    const subscriptionPlan = req.body.data.subscriptionPlan;

    const subscription = await db.insert(userSubscriptionTable).values({
        clerkUserId: userId,
        plan: subscriptionPlan,
        quotaLimit: 1000, // Example quota limit, adjust as needed
        quotaUsed: 0,
        isActive: true,
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set to renew in 30 days
        createdAt: new Date(),
    }).returning();

    console.log('User subscription updated:', subscription);
    res.status(200).json({message: 'User subscription update received'});
});

webhook.post('/user/deleted', (req, res) => {
    // Handle user deletion webhook
    console.log('User deleted:', req.body);
    res.status(200).send('User deletion received');
});

webhook.post('/user/apiKey/created', (req, res) => {
    // Handle API key creation webhook
    console.log('API key created:', req.body);
    res.status(200).json({message: 'API key creation received'});
});

