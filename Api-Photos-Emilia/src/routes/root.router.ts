import express from "express";
import { photoRouter } from "./photos.router.ts";
import { albumRouter } from "./albums.router.ts";
import { profileRouter } from "./profile.router.ts";
import { authRouter } from "./auth.router.ts";
import { verifyToken } from "../middlewares/auth/jwt.ts";

// Create a Root router
export const rootRouter = express.Router();

/**
 * GET /
 */
rootRouter.get("/", (_req, res) => {
	res.send({ status: "success", data: { message: "But first, let me take a selfie 🤳 https://www.youtube.com/watch?v=kdemFfbS5H0" }});
});

/**
 * [EXAMPLE] /resource
 */
// rootRouter.use("/resource", resourceRouter);

rootRouter.use("/photos", verifyToken, photoRouter);

rootRouter.use("/albums", verifyToken, albumRouter);

rootRouter.use("/profile", verifyToken, profileRouter);

rootRouter.use(authRouter);
