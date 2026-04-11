import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../App';
import Leaderboard from './Leaderboard';
import TaskList from './TaskList';
import Reactions from './Reactions';
import { ALL_PHOTOS, getPlayerPhoto } from '../profileConfig';

const GREETINGS = [
  (name) => `Oh look, ${name} finally showed up 👀`,
  (name) => `${name} has entered the chat 🎉`,
  (name) => `Warning: ${name} is about to be productive 💪`,
  (name) => `The legend ${name} has arrived 🦁`,
  (name) => `${name} is here! Hide the mess 🙈`,
  (name) => `Look who decided to do chores today... ${name}! 🧹`,
  (name) => `${name} loading... chore mode activated 🤖`,
  (name) => `Uh oh, ${name}'s here. Someone's getting points 😤`,
  (name) => `${name}, your chores won't do themselves (trust me, we checked) 😅`,
  (name) => `${name} has spawned into the chore dimension 🌀`,
];

const NEW_TASKS = [
  { name: 'Cook a Meal', category: 'House - Kitchen & Dining', difficulty: 'Hard', points: 40 },
  { name: 'Make a TikTok Video', category: 'Creative', difficulty: 'Hard', points: 40 },
  { name: 'Give Mom a Massage', category: 'Self Care', difficulty: 'Medium', points: 20 },
];

const TABS = [
  { id: 'home',   icon: '🏠', label: 'Home' },
  { id: 'scores', icon: '🏆', label: 'Scores' },
  { id: 'chores', icon: '✅', label: 'Chores' },
];

export default function Dashboard({ player, onSignOut, onUpdatePlayer }) {
  const [scores, setScores] = useState({});
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [weekId, setWeekId] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [allPlayers, setAllPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const [editPhoto, setEditPhoto] = useState(player.photo || null);
  const [editPhotoData, setEditPhotoData] = useState(player.photoData || null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(true);

  const greeting = useMemo(() => {
    const fn = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    return fn(player.name);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const now = new Date();
    const week = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    const wId = `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
    setWeekId(wId);

    fetchTasks();
    fetchScores(wId);
    fetchAllPlayers();
    fetchCompletions(wId);
    seedNewTasks();

    const channel = supabase
      .channel('weekly_scores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_scores' }, () => fetchScores(wId))
      .subscribe();

    return () => channel.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seedNewTasks = async () => {
    for (const task of NEW_TASKS) {
      const { data } = await supabase.from('tasks').select('id').eq('name', task.name);
      if (!data || data.length === 0) await supabase.from('tasks').insert([task]);
    }
    fetchTasks();
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (!error && data) {
      const seen = new Set();
      setTasks(data.filter(t => { if (seen.has(t.name)) return false; seen.add(t.name); return true; }));
    }
  };

  const fetchScores = async (wId) => {
    const { data, error } = await supabase.from('weekly_scores').select('*').eq('week_id', wId);
    if (!error && data) {
      const scoreMap = {};
      data.forEach(s => { scoreMap[s.player_id] = s.total_points; });
      setScores(scoreMap);
    }
  };

  const fetchAllPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*');
    if (!error && data) setAllPlayers(data);
  };

  const fetchCompletions = async (wId) => {
    const { data, error } = await supabase.from('completions').select('*').eq('week_id', wId);
    if (!error && data) setCompletions(data);
  };

  const handleDeleteCompletion = async (taskId, taskPoints) => {
    const dbPlayer = allPlayers.find(p => p.name === player.name);
    if (!dbPlayer) return;
    const completion = completions
      .filter(c => c.player_id === dbPlayer.id && c.task_id === taskId)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
    if (!completion) return;
    await supabase.from('completions').delete().eq('id', completion.id);
    const { data: existingScore } = await supabase
      .from('weekly_scores').select('id, total_points')
      .eq('player_id', dbPlayer.id).eq('week_id', weekId).single();
    if (existingScore) {
      const newTotal = existingScore.total_points - taskPoints;
      if (newTotal <= 0) await supabase.from('weekly_scores').delete().eq('id', existingScore.id);
      else await supabase.from('weekly_scores').update({ total_points: newTotal }).eq('id', existingScore.id);
    }
    fetchScores(weekId);
    fetchCompletions(weekId);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(`Delete your account "${player.name}"? This will permanently remove all your progress.`)) return;
    const dbPlayer = allPlayers.find(p => p.name === player.name);
    if (dbPlayer) await supabase.from('players').delete().eq('id', dbPlayer.id);
    onSignOut();
  };

  const resizeImage = (file) => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 300;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.floor(width * ratio); height = Math.floor(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = url;
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await resizeImage(file);
    setEditPhotoData(data);
    setEditPhoto(null);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName.length < 2) return;
    setSavingProfile(true);
    if (trimmedName !== player.name) {
      const dbPlayer = allPlayers.find(p => p.name === player.name);
      if (dbPlayer) await supabase.from('players').update({ name: trimmedName }).eq('id', dbPlayer.id);
    }
    onUpdatePlayer({ name: trimmedName, photo: editPhotoData ? null : editPhoto, photoData: editPhotoData || null });
    setSavingProfile(false);
    setEditingProfile(false);
  };

  const categories = ['All', ...new Set(tasks.map(t => t.category))];

  const filteredTasks = useMemo(() => {
    let list = selectedCategory === 'All' ? tasks : tasks.filter(t => t.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [tasks, selectedCategory, searchQuery]);

  const todayCompletions = useMemo(() => {
    const dbPlayer = allPlayers.find(p => p.name === player.name);
    if (!dbPlayer) return [];
    const todayStr = new Date().toDateString();
    return completions
      .filter(c => c.player_id === dbPlayer.id && new Date(c.completed_at).toDateString() === todayStr)
      .map(c => { const task = tasks.find(t => t.id === c.task_id); return task ? { ...c, taskName: task.name, taskPoints: task.points } : null; })
      .filter(Boolean)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  }, [completions, allPlayers, tasks, player.name]);

  const playerPhoto = getPlayerPhoto(player.name, player.photo, player.photoData);

  // Current player's weekly points
  const dbPlayer = allPlayers.find(p => p.name === player.name);
  const weeklyPoints = dbPlayer ? (scores[dbPlayer.id] || 0) : 0;

  return (
    <div className="min-h-screen bg-gray-950 pb-24">

      {/* Sticky Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10 shadow-xl">
        <div className="flex justify-between items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => { setEditName(player.name); setEditPhoto(player.photo || null); setEditPhotoData(player.photoData || null); setEditingProfile(true); }}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-700 group-hover:ring-purple-400 transition-all flex-shrink-0">
              {playerPhoto
                ? <img src={playerPhoto} alt={player.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-lg">👤</div>}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-sm font-bold text-gray-100 leading-tight">{greeting}</h1>
                <span className="text-xs text-gray-600">✏️</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">Week {weekId}</p>
            </div>
          </button>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <button onClick={onSignOut} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">Sign Out</button>
            <button onClick={handleDeleteAccount} className="px-3 py-1 bg-gray-800 text-red-500 text-xs rounded-lg hover:bg-gray-700 transition-colors">Delete Account</button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5 text-center">Edit Profile</h2>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-purple-500">
                {(() => { const src = getPlayerPhoto(editName, editPhoto, editPhotoData); return src ? <img src={src} alt="preview" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl">👤</div>; })()}
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                📷 Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center">Or pick a preset</p>
            <div className="flex gap-3 justify-center mb-5">
              {ALL_PHOTOS.map(p => (
                <button key={p.filename} onClick={() => { setEditPhoto(p.filename); setEditPhotoData(null); }}
                  className={`w-14 h-14 rounded-xl overflow-hidden transition-all ${!editPhotoData && editPhoto === p.filename ? 'ring-4 ring-purple-500 scale-105' : 'opacity-50 hover:opacity-80'}`}>
                  <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Name</p>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100 mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setEditingProfile(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-colors border border-gray-700">Cancel</button>
              <button onClick={handleSaveProfile} disabled={savingProfile || !editName.trim() || editName.trim().length < 2}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">

        {/* ── HOME TAB ── */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Weekly points hero */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700/50 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-purple-600 flex-shrink-0">
                {playerPhoto
                  ? <img src={playerPhoto} alt={player.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl">👤</div>}
              </div>
              <div>
                <p className="text-gray-400 text-sm">This week</p>
                <p className="text-4xl font-bold text-white">{weeklyPoints}<span className="text-lg text-gray-500 font-normal ml-1">pts</span></p>
                <p className="text-xs text-gray-600 mt-0.5">{todayCompletions.length} task{todayCompletions.length !== 1 ? 's' : ''} done today</p>
              </div>
            </div>

            {/* Completed Today */}
            {todayCompletions.length > 0 ? (
              <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
                <button onClick={() => setCompletedOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">✅ Completed Today</span>
                    <span className="text-xs bg-green-900/60 text-green-400 font-semibold px-2 py-0.5 rounded-full">{todayCompletions.length}</span>
                  </div>
                  <span className={`text-gray-500 text-xs transition-transform duration-200 ${completedOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {completedOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t border-gray-700/50 pt-3">
                    {todayCompletions.map(c => (
                      <div key={c.id} className="flex items-center justify-between bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-200">{c.taskName}</p>
                          <p className="text-xs text-green-400">+{c.taskPoints} pts</p>
                        </div>
                        <button onClick={() => handleDeleteCompletion(c.task_id, c.taskPoints)}
                          className="text-red-400 hover:text-red-300 text-lg leading-none px-1 transition-colors" title="Remove">🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-6 text-center">
                <p className="text-2xl mb-2">😴</p>
                <p className="text-gray-400 text-sm">No tasks completed today yet.</p>
                <p className="text-gray-600 text-xs mt-1">Head to Chores and get some points!</p>
              </div>
            )}
          </div>
        )}

        {/* ── SCORES TAB ── */}
        {activeTab === 'scores' && (
          <div className="space-y-4">
            <Leaderboard scores={scores} player={player} />
            <Reactions player={player} />
          </div>
        )}

        {/* ── CHORES TAB ── */}
        {activeTab === 'chores' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-8 pr-8 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-sm text-gray-200 placeholder-gray-500" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">✕</button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50">
              <h2 className="font-bold text-gray-100 mb-3">📋 Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${selectedCategory === cat ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-400 hover:text-gray-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <TaskList
              tasks={filteredTasks}
              player={player}
              onTaskComplete={() => { fetchScores(weekId); fetchCompletions(weekId); }}
            />
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800">
        <div className="flex max-w-2xl mx-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all ${
                activeTab === tab.id ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <span className={`text-2xl transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>{tab.icon}</span>
              <span className={`text-xs font-semibold ${activeTab === tab.id ? 'text-purple-400' : 'text-gray-600'}`}>{tab.label}</span>
              {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
