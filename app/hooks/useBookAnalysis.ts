"use client";

import { useState, useCallback } from "react";
import { useNodesState, useEdgesState, Node, Edge, MarkerType } from 'reactflow';
import { Book, AnalysisResult, NodeData, EdgeData } from "../common/types";
import { nodeColors, edgeTypesConfig } from "../config/graphConfig";

export function useBookAnalysis() {
    const [bookId, setBookId] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookData, setBookData] = useState<Book | null>(null);
    const [error, setError] = useState("");

    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);

    const generateCharacterNetwork = useCallback((analysisResult: AnalysisResult) => {
        if (analysisResult.characters && analysisResult.characters.length > 0 && analysisResult.relationships && analysisResult.relationships.length > 0) {
            const characters = analysisResult.characters;
            const relationships = analysisResult.relationships;

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

            if (newNodes.length > 0) {
                setNodes(newNodes);
                setEdges(newEdges);
            } else {
                console.error("No valid nodes to display");
                setError("Could not generate graph: No characters found.");
            }
        } else {
            console.error("Missing character or relationship data for graph generation.");
            setError("Could not generate graph: Missing character or relationship data.");
        }
    }, [setNodes, setEdges]);

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

    return {
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
    };
} 