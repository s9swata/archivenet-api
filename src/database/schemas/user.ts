import { pgTable, text, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'deleted']);

export const userTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(), 
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    fullName: text('full_name').notNull(), 
    clerkId: text('clerk_id').notNull().unique(), // Unique Clerk user ID
    metaMaskWalletAddress: text('meta_mask_wallet_address'), // Unique MetaMask wallet address
    status: text('user_status', {enum: ['active', 'suspended', 'deleted']}), // User status with column name and default
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});