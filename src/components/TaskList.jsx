import React, { useState, useEffect, useMemo } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, player, onTaskComplete }) {
  const [openCategories, setOpenCategories] = useState({});

  const dedupedTasks = useMemo(() => {
    const seen = new Set();
    return tasks.filter(t => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const grouped = {};
    dedupedTasks.forEach(task => {
      if (!grouped[task.category]) grouped[task.category] = [];
      grouped[task.category].push(task);
    });
    return grouped;
  }, [dedupedTasks]);

  const categories = Object.keys(groupedTasks);

  useEffect(() => {
    setOpenCategories(prev => {
      const next = { ...prev };
      categories.forEach(cat => { if (!(cat in next)) next[cat] = false; });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.join(',')]);

  const toggle = (cat) => setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  if (categories.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500 text-lg">📭 No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map(category => {
        const isOpen = openCategories[category] !== false;
        const taskCount = groupedTasks[category].length;

        return (
          <div key={category} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50">
            <button
              onClick={() => toggle(category)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-100">{category}</span>
                <span className="text-xs bg-purple-900/60 text-purple-300 font-semibold px-2 py-0.5 rounded-full">
                  {taskCount}
                </span>
              </div>
              <span className={`text-gray-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 grid grid-cols-1 gap-3 border-t border-gray-700/50 pt-3">
                {groupedTasks[category].map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    player={player}
                    onComplete={onTaskComplete}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
