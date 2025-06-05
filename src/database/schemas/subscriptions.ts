import { integer, pgEnum, pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const subscriptionPlanEnum = pgEnum("subscription_plans", ['basic', 'pro', 'enterprise']);

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

export type UserSubscription = typeof userSubscriptionTable.$inferSelect;
export type UserSubscriptionInsert = typeof  userSubscriptionTable.$inferInsert;