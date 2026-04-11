import React, { useState } from 'react';
import { supabase } from '../App';

export default function TaskItem({ task, player, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const difficultyEmoji = {
    'Easy': '🟢',
    'Normal': '🔵',
    'Medium': '🟡',
    'Hard': '🔴',
    'Extreme': '🟣',
    'Intense': '⚫',
    'Nightmare': '🔥'
  };

  const handleComplete = async () => {
    setLoading(true);
    setShowCelebration(true);
    setShowConfetti(true);

    try {
      const now = new Date();
      const week = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
      const weekId = `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;

      let playerId = player.dbId;
      if (!playerId) {
        const { data: playerData, error: playerError } = await supabase
          .from('players').select('id').eq('name', player.name).single();

        if (playerError && playerError.code === 'PGRST116') {
          const { data: newPlayer, error: createError } = await supabase
            .from('players').insert([{ name: player.name }]).select().single();
          if (!createError) { playerId = newPlayer.id; player.dbId = playerId; }
        } else if (playerData) {
          playerId = playerData.id;
          player.dbId = playerId;
        }
      }

      if (!playerId) throw new Error('Could not get player ID');

      await supabase.from('completions').insert([{ player_id: playerId, task_id: task.id, week_id: weekId }]);

      const { data: existingScore } = await supabase
        .from('weekly_scores').select('id, total_points')
        .eq('player_id', playerId).eq('week_id', weekId).single();

      if (existingScore) {
        await supabase.from('weekly_scores')
          .update({ total_points: existingScore.total_points + task.points })
          .eq('id', existingScore.id);
      } else {
        await supabase.from('weekly_scores')
          .insert([{ player_id: playerId, week_id: weekId, total_points: task.points }]);
      }

      onComplete();
      setTimeout(() => { setShowCelebration(false); setShowConfetti(false); }, 2000);
    } catch (error) {
      console.error('Error completing task:', error);
      setShowCelebration(false);
      setShowConfetti(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347'][Math.floor(Math.random() * 4)],
                animation: `fall ${2 + Math.random() * 1}s linear infinite`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={loading}
        className={`w-full p-4 rounded-xl font-semibold transition-all duration-200 flex justify-between items-center ${
          showCelebration
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105 shadow-xl shadow-green-900/40'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-100 hover:shadow-lg hover:shadow-black/20'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="text-left">
          <p className="font-bold">{task.name}</p>
          <p className="text-xs opacity-60 mt-0.5">{difficultyEmoji[task.difficulty]} {task.difficulty}</p>
        </div>
        <div className="text-right">
          {showCelebration ? (
            <div className="text-2xl animate-spin">✨</div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-purple-400">+{task.points}</p>
              <p className="text-xs text-gray-500">pts</p>
            </div>
          )}
        </div>
      </button>

      <style>{`
        @keyframes fall {
          to { transform: translateY(400px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
