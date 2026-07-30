import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // NIST-recommended minimum for bcrypt

/**
 * Hashes a plain-text password using bcrypt (Argon2id upgrade path ready).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Securely compares a plain-text password against a stored hash.
 * Uses a timing-safe comparison to prevent timing attacks.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
