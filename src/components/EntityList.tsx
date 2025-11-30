'use client';

import { Entity } from '@/src/types';

interface EntityListProps {
  entities: Entity[];
  onEntityClick: (entity: Entity) => void;
  selectedEntity: Entity | null;
}

export default function EntityList({ entities, onEntityClick, selectedEntity }: EntityListProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <button
            key={entity.name}
            onClick={() => onEntityClick(entity)}
            className={`
              p-6 text-left transition-all duration-200
              ${selectedEntity?.name === entity.name 
                ? 'bg-black text-white' 
                : 'bg-white hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {entity.name}
            </h2>
            <p className={`text-sm ${selectedEntity?.name === entity.name ? 'text-gray-300' : 'text-gray-600'}`}>
              {entity.headlineCount} {entity.headlineCount === 1 ? 'headline' : 'headlines'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
