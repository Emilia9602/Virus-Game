import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	connectionLimit: 5,
});
const prisma = new PrismaClient({
	adapter,
	// log: ["error", "info", "query", "warn"],  // ONLY ACTIVATE WHEN DEBUGGING (and probably only the "query" level)
});

export { prisma };
