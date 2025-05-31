"use client";

import { useState, useCallback } from "react";
import { Header } from "./components/Header";
import { Book, AnalysisResult, NodeData, EdgeData } from "./common/types";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  Node,
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

// 1. Move the CharacterNode component outside the Home function
const CharacterNode = ({ data }: { data: NodeData }) => {
  return (
    <motion.div
      className="px-4 py-2 rounded-md shadow-lg border-2 font-medium text-center"
      style={{ 
        background: data.color, 
        borderColor: `${data.color}66`, 
        color: '#fff',
        minWidth: '120px'
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 10 }}
    >
      <div className="font-bold">{data.label}</div>
      {data.role && (
        <div className="text-xs opacity-80 mt-1">{data.role}</div>
      )}
    </motion.div>
  );
};

// 2. Register node types outside the component
const nodeTypes = {
  characterNode: CharacterNode
};

export default function Home() {
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<Book | null>(null);
  const [error, setError] = useState("");
  
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  
  // Color palette for nodes
  const nodeColors = [
    "#FF5733", "#C70039", "#900C3F", "#581845", 
    "#FFC300", "#52BE80", "#1E8449", "#3498DB",
    "#8E44AD", "#5D6D7E", "#AF7AC5", "#F1C40F"
  ];

  // Edge colors
  const edgeTypes = [
    { type: "family", color: "#FF5733", label: "Family" },
    { type: "friend", color: "#3498DB", label: "Friend" },
    { type: "rival", color: "#C70039", label: "Rival" },
    { type: "romance", color: "#E91E63", label: "Romance" },
    { type: "ally", color: "#4CAF50", label: "Ally" }
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
      
      // Create nodes from characters
      const newNodes: Node<NodeData>[] = [];
      
      characters.forEach((character, index) => {
        // Calculate position in a circular layout
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
      
      // Create edges from relationships
      const newEdges: Edge<EdgeData>[] = [];
      
      relationships.forEach((rel) => {
        // Find the edge type info
        const edgeType = edgeTypes.find(t => t.type === rel.type) || edgeTypes[0];
        const significance = rel.significance || 5;
        
        // Calculate edge width based on significance
        const edgeWidth = 1 + (significance * 0.3); // Scale width by significance
        
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
  }, [nodeColors, edgeTypes, setNodes, setEdges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto p-6">
        <Header />
        
        {/* Input Form */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 mb-8 border border-blue-100 dark:border-blue-900/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              placeholder="Enter book ID (e.g. 1787 for 'Hamlet')"
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <motion.button
              onClick={fetchBook}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Loading..." : "Fetch Book"}
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

        {/* Result Display */}
        <AnimatePresence>
          {bookData && (
            <motion.div 
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-blue-100 dark:border-blue-900/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-transparent bg-clip-text">
                {bookData.metadata.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg backdrop-blur-sm border border-blue-100 dark:border-blue-800/30">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Author</h3>
                  <p className="text-slate-800 dark:text-slate-200">{bookData.metadata.author}</p>
                </div>
                <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg backdrop-blur-sm border border-sky-100 dark:border-sky-800/30">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</h3>
                  <p className="text-slate-800 dark:text-slate-200">{bookData.metadata.language}</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg backdrop-blur-sm border border-cyan-100 dark:border-cyan-800/30">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Release Date</h3>
                  <p className="text-slate-800 dark:text-slate-200">{bookData.metadata.releaseDate}</p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg backdrop-blur-sm border border-teal-100 dark:border-teal-800/30">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Subjects</h3>
                  <p className="text-slate-800 dark:text-slate-200">
                    {bookData.metadata.subjects.join(", ")}
                  </p>
                </div>
              </div>
              
              {bookData.analysisResult && (
                <div className="mt-10">
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-transparent bg-clip-text">Analysis</h3>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Summary</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{bookData.analysisResult.summary}</p>
                    </div>
                  </div>
                  
                  {bookData.analysisResult.analysis && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Themes & Setting</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                          <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Themes</h5>
                          <ul className="list-disc pl-5 text-slate-800 dark:text-slate-200">
                            {bookData.analysisResult.analysis.themes.map((theme, i) => (
                              <li key={i}>{theme}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                          <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Setting</h5>
                          <p className="text-slate-800 dark:text-slate-200">{bookData.analysisResult.analysis.setting}</p>
                          <h5 className="font-medium text-slate-700 dark:text-slate-300 mt-4 mb-2">Timeframe</h5>
                          <p className="text-slate-800 dark:text-slate-200">{bookData.analysisResult.analysis.timeframe}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Character Relationships</h4>
                    <motion.div 
                      className="bg-slate-50 dark:bg-slate-900/40 rounded-lg h-[700px] border border-slate-200 dark:border-slate-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    >
                      {nodes.length > 0 ? (
                        <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          nodeTypes={nodeTypes}
                          fitView
                        >
                          <Background color="#ffffff20" gap={16} />
                          <Controls className="bg-white/10 backdrop-blur-sm border-white/20" />
                          <MiniMap 
                            nodeColor={(node) => (node.data as NodeData).color}
                            maskColor="rgba(0, 0, 0, 0.2)"
                            className="bg-white/10 backdrop-blur-sm border-white/20"
                          />
                        </ReactFlow>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-slate-600 dark:text-slate-400">No character relationships found. Please check the console for details.</p>
                        </div>
                      )}
                    </motion.div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                      {edgeTypes.map((type) => (
                        <div key={type.type} className="flex items-center gap-2">
                          <div className="w-4 h-4" style={{ backgroundColor: type.color }}></div>
                          <span className="text-slate-700 dark:text-slate-300 text-sm">{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 text-xl">Characters</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookData.analysisResult.characters.map((character, index) => (
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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
