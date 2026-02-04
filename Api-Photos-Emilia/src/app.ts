import cors from "cors";
import express from "express";
import morgan from "morgan";
import { rootRouter } from "./routes/root.router.ts";
import { notFound } from "./middlewares/notFound.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Use dem routes
app.use(rootRouter);

/**
 * Catch-all route 🛟
 */
app.use(notFound);

app.use(errorHandler);

export default app;
