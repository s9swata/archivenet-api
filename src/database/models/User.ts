import { db } from '../db.js';
import { userTable } from '../schemas/user.js';
import { eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

type User = InferSelectModel<typeof userTable>;

export async function getUserById(userId: string): Promise<User | undefined> {
    return await db.query.userTable.findFirst({
        where: eq(userTable.clerkId, userId),
    });
}

export async function getUserByClerkId(clerkId: string): Promise<User | undefined> {
    return await db.query.userTable.findFirst({
        where: eq(userTable.clerkId, clerkId),
    });
}

export async function createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User | undefined> {
    const [newUser] = await db.insert(userTable).values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return newUser;
}

export async function updateUser(
    userId: string,
    userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User | undefined> {  
    const [updatedUser] = await db.update(userTable)
        .set({
            ...userData,
            updatedAt: new Date(),
        })
        .where(eq(userTable.clerkId, userId))
        .returning();

    return updatedUser;
}

export async function deleteUser(userId: string): Promise<any> // #TODO: Replace 'any' with the actual return type
{
    const deletedUser = await db.delete(userTable)
        .where(eq(userTable.clerkId, userId)).returning();
}