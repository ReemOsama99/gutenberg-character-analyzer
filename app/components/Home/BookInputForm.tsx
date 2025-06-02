"use client";

import { motion } from 'framer-motion';

interface BookInputFormProps {
  bookId: string;
  onBookIdChange: (id: string) => void;
  onFetchBook: () => void;
  loading: boolean;
  error: string;
}

export function BookInputForm({ 
  bookId, 
  onBookIdChange, 
  onFetchBook, 
  loading, 
  error 
}: BookInputFormProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 mb-8 border border-blue-100 dark:border-blue-900/30">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={bookId}
          onChange={(e) => onBookIdChange(e.target.value)}
          placeholder="Enter book ID (e.g. 1787 for 'Hamlet by William Shakespeare')"
          className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
        />
        <motion.button
          onClick={onFetchBook}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          {loading ? "Loading..." : "Analyze Book"}
        </motion.button>
      </div>
      {error && (
        <motion.p 
          className="mt-4 text-red-500 dark:text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
} 