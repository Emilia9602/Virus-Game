import { Photo } from "../../generated/prisma/client.ts";

export type CreatePhotoData = Omit<Photo, "id">;

export type UpdatePhotoData = Partial<CreatePhotoData>;
