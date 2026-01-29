import { Request, Response } from "express"
import { getUser, updateUser } from "../services/user.service.ts"
import { handlePrismaError } from "../lib/handlePrismaError.ts";

//Get the user's profile

export const getProfile = async (req: Request, res: Response) => {

	//Token

	//Lägg in userId här från token

	const user = await getUser(userId);

	if (!user) {
		res.status(404).send({ status: "fail", data: { message: "User Not Found"} });
		return;
	}

	res.status(200).send({ status: "success", data: {
		id: user.id,
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
	}});
}

//Update the user's profile
export const updateProfile = async (req: Request, res: Response) => {

	//Token

	//UserId från token

	//Validerad data

	//Kolla lösenord

	try {  // data = id: email: first_name last_name
		const user = await updateUser(userId, data);
		res.status(200).send({ status: "success", data: user});
	} catch (err) {
		handlePrismaError(res, err);
	}
}
