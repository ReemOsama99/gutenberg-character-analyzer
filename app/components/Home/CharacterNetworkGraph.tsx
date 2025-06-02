"use client";

import ReactFlow, { 
  Background, 
  Controls, 
  Node,
  Edge,
  Handle,
  Position,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { NodeData, EdgeData } from "../../common/types";

// CharacterNode component
const CharacterNode = ({ data }: { data: NodeData }) => {
  return (
    <motion.div
      className="px-4 py-2 rounded-md shadow-lg border-2 font-medium text-center relative"
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
      <Handle 
        type="target" 
        position={Position.Top} 
        id="target"
        style={{ background: '#555', width: '10px', height: '10px' }} 
      />
      <div className="font-bold">{data.label}</div>
      {data.role && (
        <div className="text-xs opacity-80 mt-1">{data.role}</div>
      )}
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="source"
        style={{ background: '#555', width: '10px', height: '10px' }}
      />
    </motion.div>
  );
};

// Register node types
const nodeTypes = {
  characterNode: CharacterNode
};

interface CharacterNetworkGraphProps {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  edgeTypesConfig: { type: string; color: string; label: string }[];
}

export function CharacterNetworkGraph({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange,
  edgeTypesConfig
}: CharacterNetworkGraphProps) {
  return (
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
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#ffffff20" gap={16} />
            <Controls className="bg-white/10 backdrop-blur-sm border-white/20" />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 dark:text-slate-400">No character relationships found. Please check the console for details.</p>
          </div>
        )}
      </motion.div>
      
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {edgeTypesConfig.map((type) => (
          <div key={type.type} className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: type.color }}></div>
            <span className="text-slate-700 dark:text-slate-300 text-sm">{type.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 