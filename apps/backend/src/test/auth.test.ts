import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('jwks-rsa');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment variables
    process.env.AUTH0_DOMAIN = 'test-domain.auth0.com';
    process.env.AUTH0_AUDIENCE = 'https://flora-api.com';

    // Setup mock request/response
    mockReq = {
      headers: {},
      user: undefined,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('authMiddleware', () => {
    test('should reject request without authorization header', () => {
      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid Bearer token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with malformed authorization header', () => {
      mockReq.headers!.authorization = 'InvalidFormat';

      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid Bearer token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', () => {
      mockReq.headers!.authorization = 'Bearer invalid-token';

      // Mock jwt.verify to call callback with error
      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('Invalid token') as VerifyErrors, undefined);
        }
        return {} as any;
      });

      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Token is expired, malformed, or not signed by Auth0'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should accept request with valid token', () => {
      mockReq.headers!.authorization = 'Bearer valid-token';

      const mockDecodedToken = {
        sub: 'auth0|123456',
        email: 'test@example.com',
        aud: 'https://flora-api.com',
        iss: 'https://test-domain.auth0.com/',
      };

      // Mock jwt.verify to call callback with success
      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockDecodedToken);
        }
        return {} as any;
      });

      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        id: 'auth0|123456',
        email: 'test@example.com'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    test('should continue without auth when no header provided', () => {
      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    test('should continue without auth when malformed header provided', () => {
      mockReq.headers!.authorization = 'InvalidFormat';

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    test('should attach user when valid token provided', () => {
      mockReq.headers!.authorization = 'Bearer valid-token';

      const mockDecodedToken = {
        sub: 'auth0|123456',
        email: 'test@example.com',
        aud: 'https://flora-api.com',
        iss: 'https://test-domain.auth0.com/',
      };

      // Mock jwt.verify to call callback with success
      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockDecodedToken);
        }
        return {} as any;
      });

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({
        id: 'auth0|123456',
        email: 'test@example.com'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    test('should continue without user when invalid token provided', () => {
      mockReq.headers!.authorization = 'Bearer invalid-token';

      // Mock jwt.verify to call callback with error
      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('Invalid token') as VerifyErrors, undefined);
        }
        return {} as any;
      });

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });
  });

  describe('User ID extraction', () => {
    test('should handle Auth0 user ID format', () => {
      mockReq.headers!.authorization = 'Bearer valid-token';

      const mockDecodedToken = {
        sub: 'auth0|123456789',
        email: 'test@example.com'
      };

      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockDecodedToken);
        }
        return {} as any;
      });

      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user?.id).toBe('auth0|123456789');
    });

    test('should handle Google OAuth user ID format', () => {
      mockReq.headers!.authorization = 'Bearer valid-token';

      const mockDecodedToken = {
        sub: 'google-oauth2|123456789012345678901',
        email: 'test@gmail.com'
      };

      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockDecodedToken);
        }
        return {} as any;
      });

      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user?.id).toBe('google-oauth2|123456789012345678901');
    });

    test('should handle custom email claim', () => {
      mockReq.headers!.authorization = 'Bearer valid-token';

      const mockDecodedToken = {
        sub: 'auth0|123456',
        'https://your-app/email': 'custom@example.com'
      };

      mockJwt.verify.mockImplementation((token, getKey, options, callback) => {
        if (typeof callback === 'function') {
          callback(null, mockDecodedToken);
        }
        return {} as any;
      });

      authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user?.email).toBe('custom@example.com');
    });
  });
});