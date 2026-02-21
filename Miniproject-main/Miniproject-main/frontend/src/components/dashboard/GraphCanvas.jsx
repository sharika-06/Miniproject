import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

const GraphCanvas = ({ graphData, onNodeClick, focusNodes }) => {
    console.log('[GraphCanvas] Received Data:', graphData);
    const graphRef = useRef();

    // Handle Zoom to Loop
    useEffect(() => {
        if (focusNodes && focusNodes.length > 0 && graphRef.current) {
            // Find coordinates of nodes
            const nodes = graphData.nodes.filter(n => focusNodes.includes(n.id));
            if (nodes.length === 0) return;

            // Calculate center
            const x = nodes.reduce((sum, n) => sum + (n.x || 0), 0) / nodes.length;
            const y = nodes.reduce((sum, n) => sum + (n.y || 0), 0) / nodes.length;

            // Zoom to center
            if (Number.isFinite(x) && Number.isFinite(y)) {
                graphRef.current.centerAt(x, y, 1000);
                graphRef.current.zoom(6, 2000); // Zoom level 6, duration 2s
            }
        }
    }, [focusNodes, graphData]);

    const handleZoomIn = () => {
        graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400);
    };

    const handleZoomOut = () => {
        graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400);
    };

    const handleReset = () => {
        graphRef.current?.zoomToFit(400);
    };

    return (
        <div className="relative w-full h-full bg-[#121212] overflow-hidden rounded-xl border border-white/5 shadow-inner">
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="id"
                nodeColor={node => {
                    if (node.risk > 67) return '#ef4444'; // Red
                    if (node.risk > 34) return '#f97316'; // Orange
                    return '#94a3b8'; // Grey
                }}
                nodeRelSize={6}
                linkColor={() => 'rgba(255,255,255,0.15)'}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => d.value * 0.001}
                backgroundColor="#0F0F0F"
                onNodeClick={(node) => {
                    // Center on node and zoom in
                    graphRef.current?.centerAt(node.x, node.y, 1000);
                    graphRef.current?.zoom(4, 2000);
                    onNodeClick && onNodeClick(node);
                }}
            />

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button onClick={handleZoomIn} className="p-2 bg-[#1F1F1F] border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors shadow-lg">
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={handleZoomOut} className="p-2 bg-[#1F1F1F] border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors shadow-lg">
                    <ZoomOut className="w-5 h-5" />
                </button>
                <button onClick={handleReset} className="p-2 bg-[#1F1F1F] border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors shadow-lg">
                    <Maximize className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default GraphCanvas;
