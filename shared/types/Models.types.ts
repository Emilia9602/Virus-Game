/**
 * Re-export Prisma Models to avoid circular dependencies between backend and frontend
 */
export type { Room, Player } from "../../backend/generated/prisma/client.ts"