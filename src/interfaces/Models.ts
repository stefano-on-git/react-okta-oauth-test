export interface User {
	sub: string;
	name: string;
	locale: string;
	email: string;
	gender: string;
	birthdate: string;
	nickname: string;
	preferred_username: string;
	given_name: string;
	family_name: string;
	zoneinfo: string;
	updated_at: number;
	email_verified: boolean;
}

export interface Config {
	appTitle: string;
	baseApiUrl: string;
	appId: string;
	okta: OktaConfig;
}

interface OktaConfig {
	clientID: string;
	redirectUri: string;
	tenant: string;
	responseMode: string;
	responseType: string;
	scope: string;
	state: string;
	nonce: string;
	codeChallengeMethod: string;
	codeChallenge: string;
}
