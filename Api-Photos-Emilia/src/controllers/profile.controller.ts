import { Request, Response } from "express"
import { getUser, updateUser } from "../services/user.service.ts"
import { handlePrismaError } from "../lib/handlePrismaError.ts";
import { matchedData } from "express-validator";
import { UpdateUserData } from "../types/User.types.ts";
import bcrypt from "bcrypt";

const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

//Get the user's profile

export const getProfile = async (req: Request, res: Response) => {

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const userId = Number(req.token.sub);

	const user = await getUser(userId);

	if (!user) {
		res.status(404).send({ status: "fail", data: { message: "User Not Found" } });
		return;
	}

	res.status(200).send({
		status: "success", data: {
			id: user.id,
			email: user.email,
			first_name: user.first_name,
			last_name: user.last_name,
		}
	});
}

//Update the user's profile
export const updateProfile = async (req: Request, res: Response) => {

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const userId = Number(req.token.sub);

	const dataValidated = matchedData<UpdateUserData>(req);
	const data = { ...dataValidated };

	if (data.password) {
		data.password = await bcrypt.hash(data.password, saltRounds);
	}

	try {
		const user = await updateUser(userId, data);
		res.status(200).send({
			status: "success", data: {
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}
