import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema1 from "./schemas/user";
import * as schema2 from "./schemas/apiKey";
import * as schema3 from "./schemas/subscriptions";

const schema = {
    ...schema1,
    ...schema2,
    ...schema3,
}

config({ path: ".env" }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
