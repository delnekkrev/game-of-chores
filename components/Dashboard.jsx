import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import Leaderboard from './Leaderboard';
import TaskList from './TaskList';

export default function Dashboard({ player, onSignOut }) {
  const [scores, setScores] = useState({});
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [weekId, setWeekId] = useState('');
  const [winner, setWinner] = useState(null);
  const [showWinnerAlert, setShowWinnerAlert] = useState(false);

  useEffect(() => {
    // Calculate current week ID
    const now = new Date();
    const week = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    const wId = `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
    setWeekId(wId);

    // Fetch all tasks
    fetchTasks();
    // Fetch current scores
    fetchScores(wId);
    // Set up real-time listener
    setupRealtimeListener();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (!error) setTasks(data || []);
  };

  const fetchScores = async (wId) => {
    const { data, error } = await supabase
      .from('weekly_scores')
      .select('*')
      .eq('week_id', wId);

    if (!error && data) {
      const scoreMap = {};
      data.forEach(score => {
        scoreMap[score.player_id] = score.total_points;
      });
      setScores(scoreMap);
    }
  };

  const setupRealtimeListener = () => {
    const subscription = supabase
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'weekly_scores'
      }, (payload) => {
        fetchScores(weekId);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const categories = ['All', ...new Set(tasks.map(t => t.category))];

  return (
    <div className="min-h-screen py-6 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              👋 Welcome, <span className="text-purple-600">{player.name}</span>!
            </h1>
            <p className="text-gray-600 text-sm">Week of {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Leaderboard - Left Column */}
        <div className="md:col-span-1">
          <Leaderboard scores={scores} player={player} />
        </div>

        {/* Tasks - Right Columns */}
        <div className="md:col-span-2">
          {/* Category Filter */}
          <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="font-bold text-gray-800 mb-4">📋 Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <TaskList
            tasks={
              selectedCategory === 'All'
                ? tasks
                : tasks.filter(t => t.category === selectedCategory)
            }
            player={player}
            onTaskComplete={() => fetchScores(weekId)}
          />
        </div>
      </div>
    </div>
  );
}
