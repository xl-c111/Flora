# 🌸 AI Messaging Guide

This guide explains how to run the project locally (with a focus on the AI messaging feature) and details the end-to-end flow used to generate, revise, and deliver AI-crafted gift messages via Google’s Gemini API.

---

## 📦 Setup Guide for Team Members

### 1. Pull the Latest Code
```bash
git pull origin main
```

### 2. Install New Dependencies
Since `@google/generative-ai` was added to `package.json`:
```bash
pnpm install
```

### 3. Rebuild Docker Containers
**This is CRITICAL** - you must rebuild, not just restart:
```bash
pnpm docker:dev:bg
```
Or manually:
```bash
docker-compose down
docker-compose up -d --build
```

### 4. Update Environment Variables
Add the Gemini API key to your `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Verify Everything is Running
```bash
# Check all containers are up
docker ps

# Should see:
# - flora-backend
# - flora-frontend
# - flora-postgres
# - flora-stripe-cli
```

### 6. Test the Backend
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"healthy","message":"Flora API is running!","timestamp":"..."}`

---


**After demo:** Disable it again to preserve quota for continued development.

---

## 🧪 Testing the AI Logic

The AI service includes comprehensive automated tests covering:
- Configuration & initialization
- Caching behavior (hit/miss/cleanup)
- Message generation with all parameters
- Text cleanup (removing greetings/signoffs)
- Error handling & fallbacks
- Controller endpoints
- Integration flows

**Run AI tests:**
```bash
pnpm test:ai
```

**Run all backend tests:**
```bash
pnpm test
```

**Test coverage:**
- 15 AI service tests
- Execution time: ~7-8 seconds

---

## Common Issues and Solutions

### Issue 1: Backend crashes with "Cannot find module '@google/generative-ai'"
**Cause:** You forgot to rebuild the Docker containers.

**Solution:**
```bash
docker-compose down
docker-compose up -d --build
```

### Issue 2: Port 3001 already in use
**Cause:** Backend process running on your host machine.

**Solution:** Kill the process:
```bash
lsof -ti:3001 | xargs kill -9
```
Then restart containers:
```bash
pnpm docker:dev:bg
```

### Issue 3: AI features return 500 error
**Cause:** Missing or invalid `GEMINI_API_KEY` in `.env`.

**Solution:**
1. Get your own Gemini API key from https://aistudio.google.com/app/apikey
2. Add it to `apps/backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Restart backend:
   ```bash
   docker-compose restart backend
   ```

### Issue 4: AI quota exceeded (429 error)
**Cause:** Gemini free tier has a limit of 250 requests per day.

**Solution:**
- Wait for the daily quota to reset (resets every 24 hours)
- Or get a new API key with a different Google account

---

