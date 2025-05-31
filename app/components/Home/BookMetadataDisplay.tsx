"use client";

import { BookMetadata } from "../../common/types";

interface BookMetadataDisplayProps {
  metadata: BookMetadata;
}

export function BookMetadataDisplay({ metadata }: BookMetadataDisplayProps) {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-transparent bg-clip-text">
        {metadata.title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg backdrop-blur-sm border border-blue-100 dark:border-blue-800/30">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Author</h3>
          <p className="text-slate-800 dark:text-slate-200">{metadata.author}</p>
        </div>
        <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg backdrop-blur-sm border border-sky-100 dark:border-sky-800/30">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</h3>
          <p className="text-slate-800 dark:text-slate-200">{metadata.language}</p>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg backdrop-blur-sm border border-cyan-100 dark:border-cyan-800/30">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Release Date</h3>
          <p className="text-slate-800 dark:text-slate-200">{metadata.releaseDate}</p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg backdrop-blur-sm border border-teal-100 dark:border-teal-800/30">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Subjects</h3>
          <p className="text-slate-800 dark:text-slate-200">
            {metadata.subjects.join(", ")}
          </p>
        </div>
      </div>
    </>
  );
} 