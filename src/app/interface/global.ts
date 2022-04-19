export type ID = number;
export type UUID = string;
export type UniqueID = string;
export type UserID = string; // represents email

export enum HeaderFlags {
	ApiResource = 'x-api-resource',
}

export enum ApiResources {
	Simplio = 'simplio',
	Swipelux = 'swipelux',
	Anonymous = 'anonymous',
}