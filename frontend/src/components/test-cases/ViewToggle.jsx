import React from 'react';
import { Table, Grid, Kanban, Clock } from 'lucide-react';
import { Button } from '../ui';

const ViewToggle = ({ 
  currentView, 
  onViewChange, 
  className = '' 
}) => {
  const views = [
    {
      id: 'table',
      label: 'Table',
      icon: Table,
      description: 'High density, sortable'
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: Grid,
      description: 'Visual overview'
    },
    {
      id: 'kanban',
      label: 'Kanban',
      icon: Kanban,
      description: 'Workflow view'
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      description: 'Execution history'
    }
  ];

  return (
    <div className={`flex items-center bg-apple-gray-1 rounded-apple-lg p-1 ${className}`}>
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-apple-md text-sm font-sf font-medium
              transition-all duration-200
              ${isActive 
                ? 'bg-white text-apple-gray-7 shadow-apple-sm' 
                : 'text-apple-gray-5 hover:text-apple-gray-7 hover:bg-white/50'
              }
            `}
            title={view.description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle; 