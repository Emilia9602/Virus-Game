import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
	//console.log(err);

	res.status(500).send({  status: "error", message: "Internal Server Error"});
}
