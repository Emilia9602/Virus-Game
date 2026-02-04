export interface JWTAccessTokenPayload {
	sub: string;
	email: string;
	first_name: string;
	last_name: string;
}

export interface JWTRefreshTokenPayload {
	sub: string;
}
