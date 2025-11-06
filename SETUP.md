# Frontend Setup with Backend Integration

## 🔄 Switching from Mock to Real API

The frontend is now integrated with the Supabase backend!

---

## ⚡ Quick Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This installs Supabase client and all other dependencies.

### Step 2: Create Environment File

Create `frontend/.env.local` (this file is gitignored):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Get these from:**
- Supabase Dashboard → Settings → API
- Copy **URL** and **anon public** key

### Step 3: Start Frontend

```bash
npm run dev
```

Vite will start on `http://localhost:5173`

### Step 4: Test It!

1. **Open** http://localhost:5173
2. **Click** "Sign Up"
3. **Create account:**
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Role: `Project Owner`
4. **Click** "Sign Up"

✅ **Should create account and log you in!**

5. **Create a project**
6. **Add modules, user stories, etc.**

All data is now saved to Supabase! 🎉

---

## 🔍 What Changed

### Before (Mock API):
```typescript
import { authAPI } from '../utils/mockApi'  // ❌ Old
```

Data stored in localStorage ❌

### After (Real API):
```typescript
import { authAPI } from '../utils/api'  // ✅ New
```

Data stored in Supabase database ✅

---

## 📁 Files Updated

### New Files:
- ✅ `src/utils/api.ts` - Real Supabase API client
- ✅ `src/utils/supabaseClient.ts` - Supabase config
- ✅ `SETUP.md` - This file

### Updated Files:
- ✅ `components/AuthProvider.tsx` - Uses real API
- ✅ `components/VibeEngineerDashboard.tsx` - Uses real API
- ✅ `components/ProjectLeadDashboard.tsx` - Uses real API
- ✅ `components/ProjectSelector.tsx` - Uses real API
- ✅ `hooks/useProjects.ts` - Uses real API
- ✅ `package.json` - Added @supabase/supabase-js

### Kept (for reference):
- ✅ `src/utils/mockApi.ts` - Still available for offline testing

---

## 🎯 Environment Variables

### Required:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional:
```env
# If you want to switch back to mock
VITE_USE_MOCK=false  # true = mock, false = real API
```

---

## 🧪 Testing

### Test with Real Backend:

1. **Ensure backend is running:**
```bash
cd Backend
npm run dev
```

2. **Start frontend:**
```bash
cd frontend
npm run dev
```

3. **Test flow:**
   - Signup → Login → Create Project → Add Data
   - Check Supabase Dashboard → Table Editor
   - See your data in the database! ✅

### Test with Mock (offline):

If you want to test without backend:

```typescript
// In src/utils/api.ts, temporarily import from mockApi
import * as mockApi from './mockApi'
export const authAPI = mockApi.authAPI
// etc...
```

Or create a toggle (advanced).

---

## 🔒 Security

### What's Secure:
- ✅ User passwords never stored in frontend
- ✅ JWT tokens handled by Supabase
- ✅ RLS enforces access control
- ✅ Service keys not exposed to frontend

### Environment Variables:
- ✅ `.env.local` is gitignored (not committed)
- ✅ Only anon key used in frontend (safe to expose)
- ✅ Service key stays in backend only

---

## 📊 Data Flow

```
Frontend Component
    ↓
Calls api.ts function
    ↓
Supabase Client
    ↓
Supabase Database (with RLS)
    ↓
Returns data
    ↓
Component updates UI
```

**Example:**
```typescript
// User creates project
await projectAPI.create({ name, description })
  ↓
// Supabase inserts into projects table
  ↓
// RLS checks: Is user project_owner? ✅
  ↓
// Returns created project
  ↓
// UI shows new project
```

---

## 🚨 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Fix:** Create `.env.local` file with correct values

### Issue: Can't signup/login

**Fix:** 
1. Ensure backend ran `complete_fix.sql`
2. Check `.env.local` has correct Supabase URL and key
3. Verify backend is running (if using backend API)

### Issue: Data not saving

**Fix:**
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check Supabase Dashboard → Logs
4. Ensure user has correct permissions (RLS)

---

## 🎯 Next Steps

### Development:
1. ✅ Run frontend and backend together
2. ✅ Test all features
3. ✅ Build new components
4. ✅ Add more features

### Production:
1. Deploy backend (Railway/Render/Vercel)
2. Deploy frontend (Vercel/Netlify)
3. Update `.env.local` with production Supabase URL
4. Test end-to-end

---

## 📚 More Info

- **Backend Setup:** See `Backend/START_HERE.md`
- **API Endpoints:** See `Backend/API_ENDPOINTS.md`
- **Database Schema:** See `Backend/DATABASE_SCHEMA.md`
- **Integration Details:** See `Backend/INTEGRATION_GUIDE.md`

---

## ✅ Verification

After setup:
- [ ] `.env.local` created with Supabase credentials
- [ ] `npm install` completed
- [ ] Frontend starts (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can signup new account
- [ ] Can login
- [ ] Can create project
- [ ] Data appears in Supabase Table Editor

---

**Your frontend is now connected to the real backend!** 🚀

All data is saved to Supabase database, not localStorage!

