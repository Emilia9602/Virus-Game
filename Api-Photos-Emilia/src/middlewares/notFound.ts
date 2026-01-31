import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
	res.status(404).send({ status: "error", message: `Cannot ${req.method} ${req.path}` });
}
