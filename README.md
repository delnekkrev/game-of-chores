# 🏠 Chore Reward Game

A gamified, real-time chore tracking app for families. Earn points, compete with family members, and win weekly rewards!

## Features

✨ **Real-Time Leaderboard** - Live score updates across all 3 devices  
🎉 **Gamified UI** - Celebratory animations when tasks are completed  
😢 **Motivation System** - See who's winning and catch up when falling behind  
📱 **Mobile-First** - Perfect for phones (each family member uses their own)  
⏰ **Auto-Reset** - Leaderboard resets every Friday at midnight  
🏆 **Weekly Rewards** - Winner chooses what to eat or activity  
🎯 **96 Chores** - Organized across 10 categories with 7 difficulty levels  

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Deployment**: Netlify
- **Real-time Sync**: WebSocket via Supabase

## Quick Start

### 1. Set Up Supabase
See `SETUP_GUIDE.md` for detailed instructions.

TL;DR:
1. Create free account at https://supabase.com
2. Run the SQL in `SETUP_GUIDE.md`
3. Bulk insert tasks using `INSERT_TASKS.sql`
4. Copy your API credentials

### 2. Set Up Locally

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cp .env.example .env.local
# Edit .env.local with your actual credentials

# Start dev server
npm start
```

Visit `http://localhost:3000` and sign in with your name.

### 3. Deploy to Netlify

**Option A: GitHub Deploy (Recommended)**
```bash
git push origin main
# Then connect to Netlify and add environment variables
```

**Option B: Manual Deploy**
```bash
npm run build
# Drag 'build' folder to Netlify.com
```

## How It Works

### Sign In
- Each player opens the app on their phone
- Signs in with just their name (no password needed)
- Session is stored locally on that device

### Earn Points
- Browse tasks by category
- Tap to complete a task
- Instantly see points awarded
- Leaderboard updates in real-time on all 3 phones

### Weekly Rewards
- Points accumulate all week (Mon-Fri)
- Friday at midnight: leaderboard auto-resets
- Winner announces on Friday and chooses the reward
- Reset happens automatically when app loads after midnight

### Motivation System
- See your rank on the leaderboard
- Get alerts if you're falling behind
- Celebratory animations when completing tasks

## Task Categories & Difficulties

**Categories**: Self Care, House, Yard Work, Plant Care, Cat Care, Dog Care, Gecko Care

**Difficulties** (with points):
- Easy: 5pts
- Normal: 10pts
- Medium: 20pts
- Hard: 40pts
- Extreme: 80pts
- Intense: 160pts
- Nightmare: 320pts

See `chore_game_task_plan.xlsx` for all 96 tasks.

## Database Schema

```
players (id, name, created_at)
tasks (id, name, category, difficulty, points, created_at)
completions (id, player_id, task_id, completed_at, week_id)
weekly_scores (id, player_id, week_id, total_points, winner, created_at)
```

## Troubleshooting

**Real-time updates not working?**
- Check Supabase dashboard → Real-time is enabled
- Verify environment variables are set
- Check browser console for errors

**Tasks not appearing?**
- Verify `INSERT_TASKS.sql` ran successfully
- Check that tasks are in the `tasks` table

**Leaderboard not syncing?**
- Make sure all players are signed in
- Check network connection
- Try refreshing the page

## File Structure

```
.
├── App.jsx                 # Main app component
├── package.json           # Dependencies
├── SETUP_GUIDE.md         # Detailed setup instructions
├── INSERT_TASKS.sql       # SQL to insert all 96 tasks
├── components/
│   ├── SignIn.jsx         # Sign-in page
│   ├── Dashboard.jsx      # Main dashboard
│   ├── Leaderboard.jsx    # Leaderboard component
│   ├── TaskList.jsx       # Task list view
│   └── TaskItem.jsx       # Individual task button
├── public/
│   └── index.html         # HTML entry point
├── index.js               # React entry point
├── index.css              # Global styles + Tailwind
├── tailwind.config.js     # Tailwind config
└── netlify.toml           # Netlify deployment config
```

## Customization

### Change Point Values
Edit `INSERT_TASKS.sql` before inserting tasks into Supabase.

### Add More Tasks
Use Supabase dashboard → Insert new rows in `tasks` table.

### Change Weekly Reset Day
Edit `.env.local`:
```
REACT_APP_WEEK_RESET_DAY=5  # 0=Sun, 5=Fri
REACT_APP_WEEK_RESET_HOUR=0  # Midnight
```

### Customize Colors
Edit `components/*.jsx` - look for Tailwind classes like `bg-purple-600`.

## Support

See `SETUP_GUIDE.md` for common issues and solutions.

---

**Built with ❤️ for family game nights!** 🏆
