import cors from "cors";
import express from "express";
import morgan from "morgan";
import { rootRouter } from "./routes/root.router.ts";
import { notFound } from "./middlewares/notFound.ts";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Use dem routes
app.use(rootRouter);

/**
 * Catch-all route 🛟
 */
app.use(notFound);

export default app;
