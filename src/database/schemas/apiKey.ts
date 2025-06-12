import { pgTable, uuid, text, timestamp, pgEnum, boolean, integer } from 'drizzle-orm/pg-core';
import { userTable } from './user';
import { relations } from 'drizzle-orm';

export const apiKeyTable = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
    keyId: text('key_id').notNull().unique(), // Unique identifier for the API key used for lookups
    userId: text('user_id').notNull().unique(),
    keyHash: text('key_hash').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    contract_tx_id: text('contract_tx_id').notNull(), // Arweave contract transaction ID
    arweave_wallet_address: text('arweave_wallet_address').notNull(), // Arweave wallet address
    isActive: boolean('is_active').notNull().default(false), // Acitvate api key after creating Arweave contract
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const apiKeyRelations = relations(apiKeyTable, ({ one }) => ({
    userId: one(userTable, { fields: [apiKeyTable.userId], references: [userTable.clerkId]})
}));