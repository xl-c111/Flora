# 🔐 Supabase Auth Setup Guide

Supabase Auth is perfect for Flora marketplace - it's free, supports email/password + Google OAuth, and integrates seamlessly with React.

## 🚀 Quick Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose your organization
4. Set project name: `flora-marketplace`
5. Generate a secure database password
6. Choose region closest to your users
7. Click "Create new project"

### 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. **Site URL:** `http://localhost:5173` (development)
3. **Redirect URLs:** Add these:
   ```
   http://localhost:5173
   http://localhost:5173/auth/callback
   ```

### 3. Enable Google OAuth (Optional)

1. Go to **Authentication > Providers**
2. Enable **Google** provider
3. Get Google OAuth credentials:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add Authorized JavaScript origins with frontend link: `http://localhost:5173` (development) and your production URL (when deployed)
   - Add authorized JavaScript origins: `http://localhost:5173` (and your production URL)
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback` (replace with your actual project ID)

4. Add Google Client ID and Secret to Supabase

### 4. Get API Keys

1. Go to **Settings > API**
2. Copy these values:
   - **Project URL:** `https://your-project.supabase.co`
   - **Anon Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (for backend)

---

## 🔧 Backend Integration

### 1. Install Dependencies

```bash
cd apps/backend
pnpm add @supabase/supabase-js
```

### 2. Environment Variables

Add to `apps/backend/.env`:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Supabase Client Config

Create `apps/backend/src/config/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Backend client with service role (admin access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client for auth verification
export const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY!
);
```

### 4. Auth Middleware

Create `apps/backend/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Optional auth (for routes that work with or without auth)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email!,
        };
      }
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};
```

---

## ⚛️ Frontend Integration

### 1. Install Dependencies

```bash
cd apps/frontend
pnpm add @supabase/supabase-js
```

### 2. Environment Variables

Add to `apps/frontend/.env`:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Supabase Client

Create `apps/frontend/src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Auth Context

Create `apps/frontend/src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. Login Component

Create `apps/frontend/src/components/auth/LoginForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="google-button"
      >
        Continue with Google
      </button>

      <p>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="link-button"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};
```

---

## 🔄 API Integration

### Protected API Calls

```typescript
// Frontend API client with auth
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...(session && { Authorization: `Bearer ${session.access_token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
};
```

### Backend Route Protection

```typescript
// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/subscriptions', authMiddleware, subscriptionController.create);

// Optional auth routes (work for both guest and authenticated users)
router.post('/orders', optionalAuth, orderController.create);
```

---

## ✅ Testing Your Setup

### 1. Test Authentication Flow

1. Start your dev environment: `pnpm dev`
2. Go to login page: `http://localhost:5173/login`
3. Try email/password signup
4. Try Google OAuth login
5. Check user appears in Supabase dashboard

### 2. Test API Authentication

```bash
# Get auth token from browser dev tools after login
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3001/api/profile
```

### 3. Test Guest vs User Flow

1. **Guest checkout:** Create order without login
2. **User checkout:** Login and create order
3. **Subscriptions:** Only available when logged in

---

## 🎯 Flora-Specific Benefits

### Why Supabase is Perfect for Flora:

1. **Free tier:** Perfect for demo/development
2. **Google OAuth:** Easy social login for customers
3. **Real-time:** Potential for order status updates
4. **PostgreSQL:** Works with your existing Prisma setup
5. **Row-level security:** Advanced data protection
6. **Edge functions:** Potential for recommendation logic

### Flora User Flow:

```
Guest Browse → Optional Login → Purchase/Subscribe
              ↓
         Supabase Auth → JWT Token → Protected API Routes
```

This setup gives you professional-grade authentication in minimal time, letting your team focus on the core Flora marketplace features! 🌸
