# ⚡ Quick Start Checklist

## Step 1: Set Up Supabase (5 min)
- [ ] Go to https://supabase.com → Sign up (free)
- [ ] Create new project
- [ ] Go to Settings → API
- [ ] Copy `Project URL` → save somewhere safe
- [ ] Copy `anon key` → save somewhere safe

## Step 2: Create Database (2 min)
- [ ] In Supabase, go to SQL Editor
- [ ] Click "New Query"
- [ ] Copy everything from `SETUP_GUIDE.md` (SQL section)
- [ ] Paste & click Execute ✅

## Step 3: Insert Tasks (1 min)
- [ ] New Query again
- [ ] Copy everything from `INSERT_TASKS.sql`
- [ ] Paste & click Execute ✅
- [ ] Verify 96 tasks appear in `tasks` table

## Step 4: Set Up Local App (3 min)
```bash
# Clone or download this repo
cd Rewardy-Chores

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
# REACT_APP_SUPABASE_URL=your_url_here
# REACT_APP_SUPABASE_ANON_KEY=your_key_here

# Start the app
npm start
```

Visit `http://localhost:3000` ✨

## Step 5: Test Locally (5 min)
- [ ] Open http://localhost:3000
- [ ] Sign in as Player 1 (your name)
- [ ] Open another browser tab
- [ ] Open http://localhost:3000 → Sign in as Player 2 (different name)
- [ ] In Player 1's tab: Complete a task
- [ ] Watch Player 2's leaderboard update instantly! 🎉

## Step 6: Deploy to Netlify (5 min)

### Option A: GitHub (Easiest)
- [ ] Push code to GitHub
- [ ] Go to Netlify.com → "New site from Git"
- [ ] Select your repo
- [ ] Go to Site settings → Build & Deploy → Environment
- [ ] Add variables:
  - `REACT_APP_SUPABASE_URL` = your URL
  - `REACT_APP_SUPABASE_ANON_KEY` = your key
- [ ] Deploy! 🚀

### Option B: Manual
- [ ] Run `npm run build`
- [ ] Drag `build/` folder to Netlify.com
- [ ] Add environment variables (same as above)

## Step 7: Test on Real Phones
- [ ] Get the Netlify URL (looks like `xxx.netlify.app`)
- [ ] Open on phone 1 → Sign in as Player 1
- [ ] Open on phone 2 → Sign in as Player 2
- [ ] Open on phone 3 → Sign in as Player 3
- [ ] Complete a task on any phone
- [ ] Watch leaderboard update on ALL phones instantly! 🎉

---

## That's It! 🎊

You now have a fully functional, real-time chore game with:
- ✅ Real-time leaderboard syncing
- ✅ 96 chores across 10 categories
- ✅ Exponential difficulty/point system
- ✅ Auto-reset every Friday
- ✅ Gamified animations
- ✅ Mobile-ready design

Have fun! 🏆

---

## Need Help?

See `SETUP_GUIDE.md` for troubleshooting and detailed explanations.

