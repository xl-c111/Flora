// Auth0 JWT validation middleware for Express
import { Request, Response, NextFunction } from 'express';
import jwt,  { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

// Set up JWKS client to fetch Auth0 public keys
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

// Helper to get signing key from Auth0
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// helper function to verify token
function verifyToken(token: string, cb: (err: any, decoded?: JwtPayload) => void) {
  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE, // ⚠️ probably not client ID
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    (err, decoded) => cb(err, decoded as JwtPayload)
  );
}
// attach user info to the request (to protect routes)
function attachUser(decoded: JwtPayload): { id: string; email?: string } {
  return {
    id: decoded.sub as string,
    email: (decoded as any).email ?? (decoded as any)['https://your-app/email'],
  };
}

// Middleware to require valid Auth0 JWT
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];

  verifyToken(token, (err, decoded) => {
    if (err || !decoded) return res.status(401).json({ error: 'Invalid token' });
    req.user = attachUser(decoded);
    next();
  });
};

// Optional auth (for routes that work with or without auth)
// Optional auth: attaches user if token is present, otherwise still continues
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    verifyToken(token, (err, decoded) => {
      if (!err && decoded) {
        req.user = attachUser(decoded);
      }
      next();
    });
  } else {
    next();
  }
}
