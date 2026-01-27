import cors from "cors";
import express from "express";
import morgan from "morgan";
import { rootRouter } from "./routes/root.router.ts";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Use dem routes
app.use(rootRouter);

/**
 * Catch-all route 🛟
 */
app.use((req, res) => {
	res.status(404).send({ status: "error", message: `Cannot ${req.method} ${req.path}` });
});

export default app;
