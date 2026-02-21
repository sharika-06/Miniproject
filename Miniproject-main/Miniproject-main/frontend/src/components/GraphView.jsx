import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export const GraphView = forwardRef(({ graphData = { nodes: [], links: [] }, onNodeClick }, ref) => {
    const fgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useImperativeHandle(ref, () => ({
        focusOnLoop: (nodeIds) => {
            if (!fgRef.current) return;
            // Calculate bounding box or center of these nodes
            // Simple approach: find average x,y and zoom there
            const nodes = graphData.nodes.filter(n => nodeIds.includes(n.id));
            if (nodes.length === 0) return;

            const x = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
            const y = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length;

            fgRef.current.centerAt(x, y, 1000);
            fgRef.current.zoom(6, 1000); // Zoom level 6, 1s duration
        }
    }));

    useEffect(() => {
        // Update dimensions
        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateDims);
        updateDims(); // Initial

        return () => window.removeEventListener('resize', updateDims);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full bg-neuro-bg relative overflow-hidden">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}

                // Node Styling
                nodeLabel="id"
                nodeRelSize={6}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.id;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;

                    // Node Color logic
                    const isSuspect = node.riskScore > 80;
                    ctx.fillStyle = isSuspect ? '#FF3B30' : (node.type === 'business' ? '#007AFF' : '#E0E0E0');

                    // Draw Circle (User) or Square (Business)
                    if (node.type === 'business') {
                        ctx.fillRect(node.x - 6, node.y - 6, 12, 12);
                    } else {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }

                    // Text Label
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isSuspect ? '#FF3B30' : '#808080';
                    ctx.fillText(label, node.x, node.y + 10);
                }}

                // Link Styling
                linkColor={link => link.isLoop ? '#FF3B30' : '#333333'} // Critical Red for loops
                linkWidth={link => link.isLoop ? 3 : 1}

                // Directional Arrows
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowColor={link => link.isLoop ? '#FF3B30' : '#808080'}

                // Animated Particles (Money Flow)
                linkDirectionalParticles={link => link.isLoop ? 4 : 2}
                linkDirectionalParticleWidth={link => link.isLoop ? 4 : 2}
                linkDirectionalParticleColor={link => link.isLoop ? '#FF3B30' : '#E0E0E0'}
                linkDirectionalParticleSpeed={link => link.amount > 100000 ? 0.005 : 0.002}

                backgroundColor="#00000000"
                cooldownTicks={100}
                onEngineStop={() => fgRef.current.zoomToFit(400, 50)}
                onNodeClick={onNodeClick}
            />

            {/* Legend */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur border border-white/10 p-3 rounded-lg text-xs text-neuro-muted space-y-2 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#7F1D1D] shadow-[0_0_8px_rgba(127,29,29,0.5)]"></span>
                    <span>Critical Loop ({'>'} 4)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EA580C] shadow-[0_0_8px_rgba(234,88,12,0.5)]"></span>
                    <span>Warning Loop (≤ 4)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
                    <span>Safe Connection</span>
                </div>
            </div>
        </div>
    );
});
