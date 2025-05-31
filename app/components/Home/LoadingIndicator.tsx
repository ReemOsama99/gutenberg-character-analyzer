"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingIndicatorProps {
  isLoading: boolean;
  messages: string[];
}

export function LoadingIndicator({ isLoading, messages }: LoadingIndicatorProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading && messages.length > 0) {
      // Reset progress to 0 when loading starts
      setProgress(0);
      setCurrentMessageIndex(0);

      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 2500);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 500);

      return () => {
        clearInterval(messageInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isLoading, messages]);

  useEffect(() => {
    if (!isLoading && progress > 0 && progress < 100) {
      // If loading was interrupted or finished quickly, complete the bar
      setProgress(100);
      setTimeout(() => setProgress(0), 600); // Reset after a short delay
    } else if (!isLoading) {
      setProgress(0); // Ensure progress is reset if it was already 0 or 100
      setCurrentMessageIndex(0);
    }
  }, [isLoading, progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-10 mb-8 border border-blue-100 dark:border-blue-900/30 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="mb-5">
              <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Analyzing Book...
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-5 text-sm text-center min-h-[3em]">
              {messages[currentMessageIndex] || "Processing..."}
            </p>
            <div className="w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 