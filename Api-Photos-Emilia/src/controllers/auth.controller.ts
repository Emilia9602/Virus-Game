import { Request, Response } from "express"
import { handlePrismaError } from "../lib/handlePrismaError.ts"
import { createUser, getUser, getUserByEmail } from "../services/user.service.ts";
import { StringValue } from "ms";
import { matchedData } from "express-validator";
import bcrypt from "bcrypt";
import { JWTAccessTokenPayload, JWTRefreshTokenPayload } from "../types/JWT.types.ts";
import jwt from "jsonwebtoken";
import { CreateUserData } from "../types/User.types.ts";

const AccessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME as StringValue || "4h";
const AccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const RefreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME as StringValue || "1d";
const RefreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const SaltRounds = Number(process.env.SALT_ROUNDS) || 10;

if (!AccessTokenSecret) {
	throw new Error("no ACCESS_TOKEN_SECRET could be found");
}

if (!RefreshTokenSecret) {
	throw new Error("no ACCESS_TOKEN_SECRET could be found");
}

export const register = async (req: Request, res: Response) => {

	const validatedData = matchedData<CreateUserData>(req);

	const hashedPassword = await bcrypt.hash(validatedData.password, SaltRounds);

	try {
		const user = await createUser({
			...validatedData,
			password: hashedPassword,
		});

		res.status(200).send({
			status: "success",
			data: {
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
			}
		});

	} catch (err) {
		handlePrismaError(res, err);
	}
}

interface LoginData {
	email: string;
	password: string;
}

//Log in a user

export const login = async (req: Request, res: Response) => {

	const { email, password } = matchedData<LoginData>(req);

	const user = await getUserByEmail(email);

	if (!user) {
		//Debug här
		res.status(401).send({ status: "fail", data: { message: "Authorization invaild" } });
		return;
	}

	const correctPassword = await bcrypt.compare(password, user.password);

	if (!correctPassword) {
		res.status(401).send({ status: "fail", data: { message: "Invalid Authorization" } });
		return;
	}

	const payload: JWTAccessTokenPayload = {
		sub: String(user.id),
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
	}

	const access_token = jwt.sign(payload, AccessTokenSecret, {
		expiresIn: AccessTokenLifetime,
	});

	const refresh_payload: JWTRefreshTokenPayload = {
		sub: String(user.id),
	}

	const refresh_token = jwt.sign(refresh_payload, RefreshTokenSecret, {
		expiresIn: RefreshTokenLifetime,
	});

	res.cookie("refresh_token", refresh_token, {
		httpOnly: true,
		sameSite: "strict",
		path: "/refresh",
	});

	res.send({
		status: "success",
		data: {
			access_token,
		},
	});
}

//Issue a new access_token using a refresh_token

export const refresh = async (req: Request, res: Response) => {

	const refresh_token = (req.cookies as { refresh_token?: string }).refresh_token;

	if (!refresh_token) {
		res.status(401).send({ status: "fail", data: { message: "Authorization reguired" } });
		return;
	}

	let refresh_payload: JWTRefreshTokenPayload;

	try {
		refresh_payload = jwt.verify(refresh_token, RefreshTokenSecret) as JWTRefreshTokenPayload;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			res.status(401).send({ status: "fail", data: { message: "Refresh token expired" } });
			return;
		}

		res.status(401).send({ status: "fail", data: { message: "Athorization denied" } });
		return;
	}

	const userId = Number(refresh_payload.sub);
	const user = await getUser(userId);

	if (!user) {
		res.status(401).send({ status: "fail", data: { message: "Athorization denied" } });
		return;
	}

	const access_payload: JWTAccessTokenPayload = {
		sub: String(user.id),
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
	}

	const access_token = jwt.sign(access_payload, AccessTokenSecret, {
		expiresIn: AccessTokenLifetime,
	});

	res.send({
		status: "success", data: {
			access_token,
		},
	});
}
