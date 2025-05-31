"use client";

import { Character } from "../../common/types";

interface CharacterListProps {
  characters: Character[];
  nodeColors: string[];
}

export function CharacterList({ characters, nodeColors }: CharacterListProps) {
  return (
    <div className="mb-8">
      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Characters</h4>
      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character, index) => (
            <div 
              key={character.id}
              className="p-4 rounded-lg border"
              style={{ 
                borderColor: nodeColors[index % nodeColors.length],
                backgroundColor: `${nodeColors[index % nodeColors.length]}10`
              }}
            >
              <h5 className="font-bold text-slate-800 dark:text-slate-200">{character.name}</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">{character.role}</p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">{character.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {character.traits.map((trait, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 text-xs rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 