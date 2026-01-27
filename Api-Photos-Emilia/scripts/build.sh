#!/usr/bin/env bash

## Remove build-artifacts
if [[ -d "dist" ]];
then
	echo "🧹 Build artifacts exists, removing them..."
	rm -r ./dist
fi

## Generate prisma client
echo "💎 Generating Prisma client..."
npx prisma generate

## Run build
echo "🏗️ Running build-script with hygine checks 🩹🧑‍⚕️"
npm run build-app

## Only run migrations if DATABASE_URL is set
if [[ ! -z "$DATABASE_URL" ]];
then
	echo "🗃️ DATABASE_URL exists, running migrations..."
	## Run migrations
	npx prisma migrate deploy
	echo "✅ Migrations complete."

	## Run seed (if seed-file exists in prisma/seed.ts)
	if [[ -f "prisma/seed.ts" ]];
	then
		echo "🌱👍🏻 Seed file exists, running seed..."
		npx prisma db seed
	else
		echo "🌱👎🏻 Seed file does NOT exist, skipping running seed..."
	fi
else
	echo "🛑✋🏻 DATABASE_URL does NOT exist, skipping running migrations..."
fi
