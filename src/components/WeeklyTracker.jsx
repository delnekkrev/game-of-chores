import React, { useMemo } from 'react';

export default function WeeklyTracker({ tasks, completions, players, weekId, currentPlayer, onDeleteCompletion }) {
  const difficultyEmoji = {
    'Easy': '🟢', 'Normal': '🔵', 'Medium': '🟡',
    'Hard': '🔴', 'Extreme': '🟣', 'Intense': '⚫', 'Nightmare': '🔥'
  };

  const currentDbPlayer = useMemo(
    () => players.find(p => p.name === currentPlayer?.name),
    [players, currentPlayer]
  );

  const completionMap = useMemo(() => {
    const map = {};
    completions.forEach(c => {
      const key = `${c.player_id}-${c.task_id}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [completions]);

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700/50">
        <p className="text-gray-500">No tasks available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg overflow-x-auto border border-gray-700/50">
      <h2 className="font-bold text-white mb-4">📊 Weekly Overview</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-purple-800">
            <th className="text-left py-2 px-2 font-bold text-gray-200">Task</th>
            {players.map(player => (
              <th key={player.id} className="text-center py-2 px-2 font-bold text-gray-400 min-w-max">
                <div className="text-xs">{player.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
              <td className="py-3 px-2 text-left">
                <div className="font-semibold text-gray-200">{task.name}</div>
                <div className="text-xs text-gray-500">
                  {difficultyEmoji[task.difficulty]} {task.difficulty} • +{task.points}pts
                </div>
              </td>
              {players.map(player => {
                const key = `${player.id}-${task.id}`;
                const completionCount = completionMap[key] || 0;
                const isCurrentPlayer = currentDbPlayer && player.id === currentDbPlayer.id;

                return (
                  <td key={`${player.id}-${task.id}`} className="text-center py-3 px-2">
                    {completionCount > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">✅</span>
                        {completionCount > 1 && (
                          <span className="text-xs font-bold text-green-400">×{completionCount}</span>
                        )}
                        {isCurrentPlayer && (
                          <button
                            onClick={() => onDeleteCompletion(task.id, task.points)}
                            className="text-xs text-red-500 hover:text-red-400 leading-none transition-colors"
                            title="Remove one completion"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-xs text-gray-600">
        <p>✅ = Completed | — = Not done | ×N = Done N times</p>
      </div>
    </div>
  );
}
