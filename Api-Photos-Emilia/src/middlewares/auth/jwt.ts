//Kolla om du ska lägga in debug här

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTAccessTokenPayload } from "../../types/JWT.types.ts";

const AccesTokenSecret = process.env.ACCESS_TOKEN_SECRET;

if (!AccesTokenSecret) {
	throw new Error("No ACCESS_TOKEN_SECRET defined");
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {

	if (!req.headers.authorization) {
		res.status(401).send({ status: "fail", data: { message: "Authorization header is missing" } });
		return;
	}

	const [authScheme, token] = req.headers.authorization.split(" ");

	if (authScheme.toLowerCase() !== "bearer") {
		res.status(401).send({ status: "fail", data: { message: "Authorization header invalid"} });
		return;
	}

	try {

	const payload = jwt.verify(token, AccesTokenSecret) as JWTAccessTokenPayload;

	req.token = payload;
	//SAKNAS något?

	next();

	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			res.status(401).send({ status: "fail", data: { message: "Authorization token has expired"}});
			return;
		}

		res.status(401).send({ status: "fail", data: { message: "Authorization denied"}});
		return;
	}
}
