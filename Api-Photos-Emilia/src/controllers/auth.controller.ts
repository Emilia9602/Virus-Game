import { Request, Response } from "express"
import { handlePrismaError } from "../lib/handlePrismaError.ts"
import { createUser, getUserByEmail } from "../services/user.service.ts";

export const register = async (req: Request, res: Response) => {

	//Validerad data

	//Hash + salt lösenord

	try {
		const user = await createUser({
			//Validerad data
			//Hash lösenord
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
	email: String;
	password: string;
}

//Log in a user

export const login = async (req: Request, res: Response) => {

	//Få validerad data

	const user = await getUserByEmail(email);

	if (!user) {
		//Debug här
		res.status(401).send({ status: "fail", data: { message: "Authorization invaild" }});
		return;
	}

	//Är lösenordet rätt?

	//JWT access token här

	//Signera payload

	//JWT refresh token payload här

	//Signera refresh payload med refresh token secret

	//Refresh token som en cookie

	//Svara med access token res.send()
}

//Issue a new access_token using a refresh_token

export const refresh = async (req: Request, res: Response) => {

	//Få refresh token från cookie

	//verifiera token, få payload med id(sub)
	//Try catch här

	//Hitta rätt user med id

	//Få ny access token

	//Signera payload med access token secret

	//Svara med nya access token res.send()
}
