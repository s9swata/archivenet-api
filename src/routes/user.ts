import express from 'express';
import { db } from '../database/db';
import { createUser, deleteUser, getUserByClerkId, updateUser } from '../database/models/User';

export const userRouter = express.Router();

userRouter.use("/create", async (req, res) => {
  const clerkId = req.body.clerkId;
  const email = req.body.email;
  const username = req.body.username || email;
  const fullName = req.body.fullName || username;
  const metaMaskWalletAddress = req.body.metaMaskWalletAddress || '';

  try {
    const existingUser = await getUserByClerkId(clerkId);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await createUser({clerkId, email, username, fullName, metaMaskWalletAddress, status: 'active', lastLoginAt: new Date()});

    return res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

userRouter.post('/info', async (req, res) => {
  const userId = req.body.userId;
  console.log(req.body);

  try {
    const user = await getUserByClerkId(userId);
    if (user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user info:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

userRouter.put('/update', async (req, res) => {
  const userId = req.body.userId;
  const updates = req.body.updates;

  try {
    const updatedUser = await updateUser(userId, updates);

    if (updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

userRouter.delete('/delete', async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedUser = await deleteUser(userId);
    return res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
