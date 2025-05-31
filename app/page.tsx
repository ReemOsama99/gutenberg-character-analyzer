"use client";

import { useState, useCallback } from "react";
import { Header } from "./components/Home/Header";
import { Book, AnalysisResult, NodeData, EdgeData } from "./common/types";
import {
  useNodesState, 
  useEdgesState,
  Node,
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { BookInputForm } from "./components/Home/BookInputForm";
import { BookMetadataDisplay } from "./components/Home/BookMetadataDisplay";
import { AnalysisDisplay } from "./components/Home/AnalysisDisplay";
import { CharacterNetworkGraph } from "./components/Home/CharacterNetworkGraph";
import { CharacterList } from "./components/Home/CharacterList";
import { LoadingIndicator } from "./components/Home/LoadingIndicator";

export default function Home() {
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<Book | null>(null);
  const [error, setError] = useState("");
  
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  
  const nodeColors = [
    "#FF5733", "#C70039", "#900C3F", "#581845", 
    "#FFC300", "#52BE80", "#1E8449", "#3498DB",
    "#8E44AD", "#5D6D7E", "#AF7AC5", "#F1C40F"
  ];

  const edgeTypesConfig = [
    { type: "family", color: "#FF5733", label: "Family" },
    { type: "friend", color: "#3498DB", label: "Friend" },
    { type: "rival", color: "#C70039", label: "Rival" },
    { type: "romance", color: "#E91E63", label: "Romance" },
    { type: "ally", color: "#4CAF50", label: "Ally" }
  ];

  // Define messages for the loading indicator
  const loadingMessages = [
    "Here we go...",
    "Hold on, we're almost done...",
    "Wait a bit...",
    "A few more seconds...",
    "Almost there..."
  ];

  const fetchBook = async () => {
    if (!bookId.trim()) {
      setError("Please enter a book ID");
      return;
    }
    
    setLoading(true);
    setError("");
    setBookData(null);
    setNodes([]);
    setEdges([]);
    
    try {
      const response = await fetch(`/api/analyze-book?bookId=${bookId.trim()}`);
      const data = await response.json();
      
      if (data.success) {
        console.log("API Response:", data);
        setBookData(data);
        if (data.analysisResult) {
          generateCharacterNetwork(data.analysisResult);
        }
      } else {
        setError(data.error || "Failed to fetch book");
      }
    } catch (err) {
      setError("An error occurred while fetching the book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCharacterNetwork = useCallback((analysisResult: AnalysisResult) => {
    console.log("Generating character network with:", analysisResult);
    
    if (analysisResult.characters && analysisResult.characters.length > 0 && analysisResult.relationships && analysisResult.relationships.length > 0) {
      const characters = analysisResult.characters;
      const relationships = analysisResult.relationships;
      
      console.log("Characters:", characters);
      console.log("Relationships:", relationships);
      
      const newNodes: Node<NodeData>[] = [];
      
      characters.forEach((character, index) => {
        const angle = (index / characters.length) * 2 * Math.PI;
        const radius = 300;
        const x = radius * Math.cos(angle) + 400;
        const y = radius * Math.sin(angle) + 300;
        
        newNodes.push({
          id: character.id,
          position: { x, y },
          data: { 
            label: character.name, 
            description: character.description, 
            color: nodeColors[index % nodeColors.length],
            role: character.role,
            traits: character.traits
          },
          type: 'characterNode'
        });
      });
      
      console.log("Created nodes:", newNodes);
      
      const newEdges: Edge<EdgeData>[] = [];
      
      relationships.forEach((rel) => {
        const edgeType = edgeTypesConfig.find(t => t.type === rel.type) || edgeTypesConfig[0];
        const significance = rel.significance || 5;
        const edgeWidth = 1 + (significance * 0.3);
        
        newEdges.push({
          id: rel.id,
          source: rel.source,
          target: rel.target,
          animated: true,
          style: { stroke: edgeType.color, strokeWidth: edgeWidth },
          label: `${edgeType.label} (${significance}/10)`,
          labelStyle: { fill: edgeType.color, fontWeight: 700, fontSize: 12 },
          markerEnd: {
            type: MarkerType.Arrow,
            color: edgeType.color,
          },
          data: {
            description: rel.description,
            significance: significance,
            type: rel.type
          }
        });
      });
      
      console.log("Created edges:", newEdges);
      
      if (newNodes.length > 0) {
        setNodes(newNodes);
        setEdges(newEdges);
        console.log("Final nodes and edges:", { nodes: newNodes, edges: newEdges });
      } else {
        console.error("No valid nodes to display");
      }
    } else {
      console.error("Missing character or relationship data");
    }
  }, [nodeColors, edgeTypesConfig, setNodes, setEdges]);

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

        {/* Conditionally render LoadingIndicator or results */}
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
                  <CharacterNetworkGraph 
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    edgeTypesConfig={edgeTypesConfig}
                  />
                  <CharacterList 
                    characters={bookData.analysisResult.characters} 
                    nodeColors={nodeColors} 
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
