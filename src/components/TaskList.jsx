import React from 'react';
import TaskItem from './TaskItem';

const ACCENT = {
  yellow: { border: 'border-yellow-500/20', header: 'text-yellow-400' },
  blue:   { border: 'border-blue-500/20',   header: 'text-blue-400'   },
  purple: { border: 'border-purple-500/20', header: 'text-purple-400' },
};

export default function TaskSection({ title, tasks, completed, onToggle, accentColor = 'blue', justChecked }) {
  const style = ACCENT[accentColor] || ACCENT.blue;
  const doneTasks = tasks.filter(t => completed.has(t.id));
  const sectionPts = doneTasks.reduce((s, t) => s + t.points, 0);
  const maxPts     = tasks.reduce((s, t) => s + t.points, 0);
  const allDone    = doneTasks.length === tasks.length;

  return (
    <div className={`bg-slate-800 rounded-2xl border ${style.border} overflow-hidden`}>

      {/* Section header */}
      <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <h2 className={`font-bold text-sm ${style.header}`}>
          {title} {allDone && '✅'}
        </h2>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>
            <span className="text-yellow-400 font-bold">{sectionPts}</span>/{maxPts} pts
          </span>
          <span className="text-slate-600">·</span>
          <span>{doneTasks.length}/{tasks.length}</span>
        </div>
      </div>

      {/* Task list */}
      <div className="p-3 space-y-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isCompleted={completed.has(task.id)}
            onToggle={onToggle}
            justChecked={justChecked === task.id}
          />
        ))}
      </div>
    </div>
  );
}
