import { Request, Response } from "express"
import { handlePrismaError } from "../lib/handlePrismaError.ts"
import { createUser } from "../services/user.service.ts";

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
