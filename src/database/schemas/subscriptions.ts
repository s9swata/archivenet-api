import { integer, pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";
import { relations } from "drizzle-orm";

export const userSubscriptionTable = pgTable("user_subscriptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    plan: text("subscription_plans", { enum: ['basic', 'pro', 'enterprise'] }).notNull(),
    quotaLimit: integer("quota_limit").notNull(),
    quotaUsed: integer("quota_used").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    renewsAt: timestamp("renews_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const userSubscriptionRelations = relations(userSubscriptionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [userSubscriptionTable.clerkUserId],
        references: [userTable.clerkId]
    })
}));