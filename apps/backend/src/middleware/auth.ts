/**
 * Auth0 JWT validation middleware for Express
 *
 * Provides required and optional authentication middleware using Auth0 tokens.
 * Validates JWT signatures using Auth0's JWKS public keys.
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

/**
 * Express Request extended with authenticated user info
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;      // Auth0 user ID (from 'sub' claim)
    email?: string;  // User's email address
  };
}

/**
 * JWKS (JSON Web Key Set) client for fetching Auth0's public keys
 * These keys are used to verify the signature of incoming JWT tokens
 *
 * The JWKS endpoint contains the public keys that correspond to the private keys
 * Auth0 uses to sign JWT tokens. This allows us to verify token authenticity.
 */
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,        // Cache keys to improve performance
  rateLimit: true,    // Rate limit requests to JWKS endpoint
  jwksRequestsPerMinute: 5,
});

/**
 * Retrieves the signing key for JWT verification from Auth0's JWKS endpoint
 */
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ Error fetching signing key:', err);
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verifies a JWT token using Auth0's public keys and validation rules
 *
 * This function validates:
 * - Token signature (using Auth0's public key)
 * - Token audience (must match our API identifier)
 * - Token issuer (must be from our Auth0 domain)
 * - Token algorithm (must be RS256)
 * - Token expiration (automatically checked by jsonwebtoken)
 *
 * @param token - The JWT token to verify
 * @param cb - Callback function with error or decoded token payload
 */
function verifyToken(token: string, cb: (err: any, decoded?: JwtPayload) => void): void {
  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,           // Must match API identifier in Auth0
      issuer: `https://${process.env.AUTH0_DOMAIN}/`, // Must be from our Auth0 domain
      algorithms: ['RS256'],                          // Auth0 uses RS256 algorithm
    },
    (err, decoded) => {
      if (err) {
        console.error('❌ JWT verification failed:', err.message);
      }
      cb(err, decoded as JwtPayload);
    }
  );
}

/**
 * Extracts user info from verified JWT token payload
 */
function attachUser(decoded: JwtPayload): { id: string; email?: string } {
  return {
    id: decoded.sub as string, // Auth0 user ID (format: "auth0|123456" or "google-oauth2|123456")
    email: (decoded as any).email ?? (decoded as any)['https://your-app/email'], // Email from token
  };
}

/**
 * Required Authentication Middleware
 *
 * Requires valid JWT token. Returns 401 if missing or invalid.
 * After successful auth, req.user contains user info.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and has correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ Missing or malformed authorization header');
    res.status(401).json({
      error: 'Missing or invalid authorization header',
      message: 'Please provide a valid Bearer token'
    });
    return;
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];

  // Verify the JWT token
  verifyToken(token, (err, decoded) => {
    if (err || !decoded) {
      console.warn('⚠️ Token verification failed for protected route');
      res.status(401).json({
        error: 'Invalid token',
        message: 'Token is expired, malformed, or not signed by Auth0'
      });
      return;
    }

    // Attach user info to request for use in route handlers
    req.user = attachUser(decoded);
    console.log('✅ User authenticated:', req.user.id);
    next();
  });
};

/**
 * Optional Authentication Middleware
 *
 * Attaches user info if valid token provided, otherwise continues without auth.
 * Useful for routes that work differently for logged-in vs anonymous users.
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  verifyToken(token, (err, decoded) => {
    if (!err && decoded) {
      req.user = attachUser(decoded);
    }
    next();
  });
}
