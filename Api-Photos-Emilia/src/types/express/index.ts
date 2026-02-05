import { JWTAccessTokenPayload } from "../JWT.types.ts";

declare module "express-serve-static-core" {
	interface Request {
		token?: JWTAccessTokenPayload;
	}
}
