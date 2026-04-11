# Chore Reward Game - Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Once created, go to **Settings → API** and copy:
   - `Project URL` (save as `REACT_APP_SUPABASE_URL`)
   - `anon key` (save as `REACT_APP_SUPABASE_ANON_KEY`)

### Step 2: Set Up Database
1. Go to **SQL Editor** in Supabase
2. Click **"New Query"** and paste this SQL:

```sql
-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create completions table (tracks when tasks are done)
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  week_id TEXT NOT NULL -- Format: YYYY-W01, YYYY-W02, etc
);

-- Create weekly scores table
CREATE TABLE weekly_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  week_id TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, week_id)
);

-- Enable Real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE completions;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- Create indexes for performance
CREATE INDEX idx_completions_player ON completions(player_id);
CREATE INDEX idx_completions_week ON completions(week_id);
CREATE INDEX idx_weekly_scores_week ON weekly_scores(week_id);
```

3. Click **Execute** and wait for success

### Step 3: Insert Tasks
1. In **SQL Editor**, create **New Query** and paste the task data (96 tasks across 10 categories)
2. Or use the "Insert rows manually" feature in the **tasks** table

Here's a sample insert (insert all 96 tasks similarly):

```sql
INSERT INTO tasks (name, category, difficulty, points) VALUES
('Shower/Bath', 'Self Care', 'Normal', 10),
('Brush teeth (morning)', 'Self Care', 'Easy', 5),
('Do the dishes', 'House - Kitchen & Dining', 'Normal', 10),
('Vacuum living room', 'House - General Cleaning', 'Normal', 10),
('Water outdoor plants', 'Yard Work', 'Easy', 5),
('Water indoor plants', 'Plant Care', 'Easy', 5),
('Feed cat (daily)', 'Cat Care', 'Easy', 5),
('Feed dog (daily)', 'Dog Care', 'Easy', 5),
('Feed gecko (dusted crickets)', 'Gecko Care', 'Easy', 5),
... (continue for all 96 tasks)
```

### Step 4: Set Up Environment Variables

Create a `.env.local` file in your React app root:

```
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_WEEK_RESET_DAY=5  # 0=Sun, 5=Fri
REACT_APP_WEEK_RESET_HOUR=0  # Midnight in your timezone
```

### Step 5: Run Locally
```bash
npm install
npm start
```

Visit `http://localhost:3000` and test with 3 different player names.

---

## Deploy to Netlify

### Option A: GitHub Deploy (Easiest)
1. Push code to GitHub
2. Go to Netlify.com → **New site from Git**
3. Connect GitHub, select your repo
4. Add environment variables in **Site Settings → Build & Deploy → Environment**:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
5. Deploy!

### Option B: Manual Deploy
```bash
npm run build
# Drag the 'build' folder to Netlify.com
```

---

## Testing Real-Time Sync

1. Open the app on 3 different devices/browsers
2. Sign in as different players
3. Complete a task on one device
4. Watch the leaderboard update instantly on the other two ✨

---

## Troubleshooting

**Tasks not appearing?**
- Check that tasks were inserted into the database
- Verify Supabase connection in browser console

**Leaderboard not updating?**
- Check that Real-time is enabled in Supabase SQL
- Verify RLS (Row Level Security) is disabled or properly configured

**Auto-reset not working?**
- Resets happen when the app loads, not in the background
- App must be open on Friday midnight for reset to trigger

---

## Task Data (All 96 Tasks)

See `chore_game_task_plan.xlsx` for the complete task list with all categories and difficulties.

You can bulk-insert them using the SQL provided above.

