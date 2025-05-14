import crypto from 'crypto';

// Shared function for consistent QR code signature generation/validation
export function generateSignature(data: string): string {
	// IMPORTANT: Use the exact same secret key for both generation and validation
	const secret = 'attendance-system-secret-key';
	const hash = crypto.createHash('sha256');
	hash.update(data + secret);
	return hash.digest('hex').substring(0, 16);
}
