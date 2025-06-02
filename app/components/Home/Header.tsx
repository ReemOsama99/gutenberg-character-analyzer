import React from 'react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header 
      className="mb-10 text-center p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="inline-block mb-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 dark:from-blue-500 dark:via-sky-400 dark:to-cyan-400 text-transparent bg-clip-text pb-2">
            Gutenberg Insights
          </h1>
          <div className="relative w-full h-1 mt-5">
            <div className="absolute top-0 bottom-0 left-[-3rem] right-[-3rem] bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 rounded-full"></div>
          </div>
        </div>
        <p className="text-lg text-slate-500 dark:text-slate-300 max-w-2xl mx-auto">
          Journey through the social fabric of literary masterpieces with interactive visualizations.
        </p>
      </motion.div>
      <motion.div 
        className="mt-4 flex justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-full text-xs text-slate-700 dark:text-slate-300 border border-blue-300 dark:border-blue-800">
          Character Analysis
        </span>
        <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/40 rounded-full text-xs text-slate-700 dark:text-slate-300 border border-sky-300 dark:border-sky-800">
          Interactive Visualization
        </span>
        <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 rounded-full text-xs text-slate-700 dark:text-slate-300 border border-cyan-300 dark:border-cyan-800">
          Relationship Mapping
        </span>
      </motion.div>
    </motion.header>
  );
} 