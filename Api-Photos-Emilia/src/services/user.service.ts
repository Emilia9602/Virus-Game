import { prisma } from "../lib/prisma.ts";
import { CreateUserData, UpdateUserData } from "../types/User.types.ts";

//Get a user

/**
 * @param id ID of the user to get
 */

export const getUser = async (id: number) => {
	return await prisma.user.findUnique({
		where: { id },
	});
}

//Update a user

/**
 * @param userId ID of the user to update
 * @param data Data to update the user with
 */

export const updateUser = (userId: number, data: UpdateUserData) => {
	return prisma.user.update({
		where: {
			id: userId,
		},
		data,
	});
}

//Create a user

/**
 * @param data User data
 */

export const createUser = (data: CreateUserData) => {
	return prisma.user.create({
		data,
	});
}

//Get a user by user's email

/**
 * @param email Email of the user to get
 */

export const getUserByEmail = async (email: string) => {
	return await prisma.user.findUnique({
		where: { email },
	});
}
