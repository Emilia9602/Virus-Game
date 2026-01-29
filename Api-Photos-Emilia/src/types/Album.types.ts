import type { Album } from "../../generated/prisma/client.ts";

export type CreateAlbumData = Omit<Album, "id">;
