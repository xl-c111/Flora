// Auth0 JWT validation middleware for Express
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
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

  // Verify JWT using Auth0 public keys
  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_CLIENT_ID,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      // Attach user info from token to request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
      };
      next();
    }
  );
};

// Optional auth (for routes that work with or without auth)
// Optional auth: attaches user if token is present, otherwise continues
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_CLIENT_ID,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      },
      (err: any, decoded: any) => {
        if (!err && decoded) {
          req.user = {
            id: decoded.sub,
            email: decoded.email,
          };
        }
        next();
      }
    );
  } else {
    next();
  }
};
