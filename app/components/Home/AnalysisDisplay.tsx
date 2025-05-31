"use client";

import { AnalysisResult } from "../../common/types";

interface AnalysisDisplayProps {
  analysisResult: AnalysisResult;
}

export function AnalysisDisplay({ analysisResult }: AnalysisDisplayProps) {
  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-transparent bg-clip-text">Analysis</h3>
      
      <div className="mb-8">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Summary</h4>
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{analysisResult.summary}</p>
        </div>
      </div>
      
      {analysisResult.analysis && (
        <div className="mb-8">
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Themes & Setting</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Themes</h5>
              <ul className="list-disc pl-5 text-slate-800 dark:text-slate-200">
                {analysisResult.analysis.themes.map((theme, i) => (
                  <li key={i}>{theme}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Setting</h5>
              <p className="text-slate-800 dark:text-slate-200">{analysisResult.analysis.setting}</p>
              <h5 className="font-medium text-slate-700 dark:text-slate-300 mt-4 mb-2">Timeframe</h5>
              <p className="text-slate-800 dark:text-slate-200">{analysisResult.analysis.timeframe}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 