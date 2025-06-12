import express from 'express';
import { createUserSubscription, getUserSubscription, updateUserSubscription, deleteUserSubscription } from '../database/models/UserSubscription';

export const userSubscriptionsRouter = express.Router();

userSubscriptionsRouter.post('/create', async (req, res) => {
    const txnId = req.body.transactionId;
    const userId = req.userId;
    const subscriptionPlan = req.body.subscriptionPlan;
    const quotaLimit = req.body.quotaLimit || 1000; // Default quota limit if not provided
    try{
        const subscription = await createUserSubscription({
            clerkUserId: userId,
            plan: subscriptionPlan,
            quotaLimit,
            renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}); // Set renewsAt to 30 days from now
        console.log('User subscription updated:', subscription);
        res.status(200).json({message: 'User subscription update received'});
    }
    catch(err){
            console.error('Error creating user subscription:', err);
            res.status(500).json({ error: 'Internal server error' });
    }        
})

userSubscriptionsRouter.get('/list/:userId', async (req, res) => {
    const userId = req.params.userId;
    const subscription = await getUserSubscription(userId);
    try{
    if (!subscription) {
        return res.status(404).json({ error: 'No subscription found for this user' });
    }
    console.log('User subscription details:', subscription);
    res.status(200).json({ message: 'List of user subscriptions' });
    }catch(err){
        console.error('Error fetching user subscription:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

userSubscriptionsRouter.put('/update/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updates = req.body;

    try {
        const updatedSubscription = await updateUserSubscription(userId, updates);
        if (updatedSubscription.length === 0) {
            return res.status(404).json({ error: 'No subscription found for this user' });
        }
        console.log('User subscription updated:', updatedSubscription);
        res.status(200).json(updatedSubscription);
    } catch (err) {
        console.error('Error updating user subscription:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

userSubscriptionsRouter.delete('/delete/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        await deleteUserSubscription(userId);
        console.log('User subscription deleted:', userId);
        res.status(200).json({ message: 'User subscription deleted successfully' });
    } catch (err) {
        console.error('Error deleting user subscription:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});