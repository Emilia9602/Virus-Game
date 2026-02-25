import { prisma } from "../src/lib/prisma.ts";

const main = async () => {
	// 🌱 Here be all your seeds 🍼👶🏻...

	/**
	 * Create all the neccessary rooms
	 */
	await prisma.gameRoom.upsert({
		where: { id: "General" },
		update: {},
		create: { id: "General" },
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (err) => {
		console.error(err);
		await prisma.$disconnect();
		process.exit(1);
	});
