import type { User } from "../../generated/prisma/client.ts";

export type CreateUserData = Omit<User, "id">;

export type UpdateUserData = Partial<CreateUserData>;
