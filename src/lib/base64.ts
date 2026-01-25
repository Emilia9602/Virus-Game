/**
 * Base64 encoding and decoding utilities.
 */

/**
 * Encodes a string to Base64 format.
 *
 * @param input - The string to encode
 * @returns Base64 encoded string
 */
export function encodeBase64(input: string): string {
	return Buffer.from(input, "utf-8").toString("base64");
}

/**
 * Decodes a Base64 encoded string.
 * @param input - The Base64 encoded string to decode
 * @returns Decoded string
 */
export function decodeBase64(input: string): string {
	return Buffer.from(input, "base64").toString("utf-8");
}
