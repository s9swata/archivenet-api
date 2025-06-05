import { pgTable, uuid, text, timestamp, pgEnum, boolean, integer } from 'drizzle-orm/pg-core';
import { userTable } from './user';

export const apiKeyTable = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
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

export type ApiKey = typeof apiKeyTable.$inferSelect;
export type ApiKeyInsert = typeof apiKeyTable.$inferInsert;