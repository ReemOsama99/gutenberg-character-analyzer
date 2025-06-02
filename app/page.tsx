"use client";

import { Header } from "./components/Home/Header";
import { motion, AnimatePresence } from 'framer-motion';

import { BookInputForm } from "./components/Home/BookInputForm";
import { BookMetadataDisplay } from "./components/Home/BookMetadataDisplay";
import { AnalysisDisplay } from "./components/Home/AnalysisDisplay";
import { CharacterNetworkGraph } from "./components/Home/CharacterNetworkGraph";
import { CharacterList } from "./components/Home/CharacterList";
import { LoadingIndicator } from "./components/Home/LoadingIndicator";
import { useBookAnalysis } from "./hooks/useBookAnalysis";
import { nodeColors, edgeTypesConfig } from "./config/graphConfig";

export default function Home() {
  const {
    bookId,
    setBookId,
    loading,
    bookData,
    error,
    nodes,
    onNodesChange,
    edges,
    onEdgesChange,
    fetchBook
  } = useBookAnalysis();
  
  const loadingMessages = [
    "Here we go...",
    "Hold on, we're almost done...",
    "Wait a bit...",
    "A few more seconds...",
    "Almost there..."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto p-6">
        <Header />
        
        <BookInputForm 
          bookId={bookId}
          onBookIdChange={setBookId}
          onFetchBook={fetchBook}
          loading={loading}
          error={error}
        />

        {loading && <LoadingIndicator isLoading={loading} messages={loadingMessages} />}

        <AnimatePresence>
          {!loading && bookData && (
            <motion.div 
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-blue-100 dark:border-blue-900/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BookMetadataDisplay metadata={bookData.metadata} />
              
              {bookData.analysisResult && (
                <>
                  <AnalysisDisplay analysisResult={bookData.analysisResult} />
                  <CharacterList 
                    characters={bookData.analysisResult.characters} 
                    nodeColors={nodeColors}
                  />
                  <CharacterNetworkGraph 
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    edgeTypesConfig={edgeTypesConfig}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
