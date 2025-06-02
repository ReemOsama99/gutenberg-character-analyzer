"use client";

import { Character } from "../../common/types";
import { useState } from "react";
import { motion } from "framer-motion";

interface CharacterListProps {
  characters: Character[];
  nodeColors: string[];
}

export function CharacterList({ characters, nodeColors }: CharacterListProps) {
  const [flippedStates, setFlippedStates] = useState<boolean[]>(
    Array(characters.length).fill(false)
  );

  const handleFlip = (index: number) => {
    const newFlippedStates = [...flippedStates];
    newFlippedStates[index] = !newFlippedStates[index];
    setFlippedStates(newFlippedStates);
  };

  return (
    <div className="mb-8">
      <div className="flex items-baseline mb-2">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-xl mr-2">Characters</h4>
        <p className="text-sm italic text-slate-500 dark:text-slate-400">Tap and Reveal Character Profiles</p>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {characters.map((character, index) => (
            <motion.div
              key={character.id}
              className="relative w-full h-40 cursor-pointer"
              onClick={() => handleFlip(index)}
              initial={false}
              animate={{ rotateY: flippedStates[index] ? 180 : 0 }}
              transition={{ duration: 0.6, animationDirection: "normal" }}
              style={{ 
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <motion.div
                className="absolute w-full h-full p-4 rounded-lg border flex flex-col justify-center items-center"
                style={{
                  borderColor: nodeColors[index % nodeColors.length],
                  backgroundColor: `${nodeColors[index % nodeColors.length]}1A`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden"
                }}
              >
                <h5 className="font-semibold text-xl text-slate-800 dark:text-slate-200">{character.name}</h5>
              </motion.div>

              <motion.div
                className="absolute w-full h-full p-4 rounded-lg border flex flex-col"
                style={{
                  borderColor: nodeColors[index % nodeColors.length],
                  backgroundColor: `${nodeColors[index % nodeColors.length]}1A`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <h5 className="font-bold text-slate-800 dark:text-slate-200">{character.name}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">{character.role}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 overflow-y-auto flex-grow">{character.description}</p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {character.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 