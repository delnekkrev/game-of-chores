import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, player, onTaskComplete }) {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    // Group tasks by category
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.category]) {
        grouped[task.category] = [];
      }
      grouped[task.category].push(task);
    });
    setGroupedTasks(grouped);
  }, [tasks]);

  const handleTaskComplete = () => {
    setCompletedCount(prev => prev + 1);
    onTaskComplete();
  };

  const categories = Object.keys(groupedTasks);

  if (categories.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center">
        <p className="text-gray-600 text-lg">📭 No tasks in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-300">
            📌 {category}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {groupedTasks[category].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                player={player}
                onComplete={handleTaskComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
