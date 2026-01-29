import express from "express";

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

// LÄGG IN ALLA ROUTER HÄR SEN
