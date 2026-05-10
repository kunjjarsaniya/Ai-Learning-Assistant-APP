import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    getNodesBounds,
    getTransformForBounds,
    useReactFlow
} from 'reactflow';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import { Download, RotateCcw, Maximize, MousePointer2 } from 'lucide-react';
import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ 
        rankdir: direction,
        nodesep: 100,
        ranksep: 140,
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};

const MindMapComponent = ({ initialNodes, initialEdges }) => {
    const { getNodes, getEdges, fitView } = useReactFlow();

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
        () => getLayoutedElements(initialNodes, initialEdges),
        [initialNodes, initialEdges]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        window.requestAnimationFrame(() => fitView({ padding: 0.3 }));
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges, fitView]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onResetLayout = useCallback(() => {
        const { nodes: resetNodes, edges: resetEdges } = getLayoutedElements(nodes, edges);
        setNodes([...resetNodes]);
        setEdges([...resetEdges]);
        window.requestAnimationFrame(() => fitView({ padding: 0.3, duration: 800 }));
    }, [nodes, edges, setNodes, setEdges, fitView]);

    const onDownload = useCallback(() => {
        const nodes = getNodes();
        const nodesBounds = getNodesBounds(nodes);
        
        // Dynamic sizing based on content
        const padding = 100;
        const width = nodesBounds.width + padding * 2;
        const height = nodesBounds.height + padding * 2;
        
        const transform = getTransformForBounds(nodesBounds, width, height, 0.5, 2);

        const viewport = document.querySelector('.react-flow__viewport');
        if (!viewport) return;

        toPng(viewport, {
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            style: {
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        }).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `mind-map-rankup-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        });
    }, [getNodes]);

    return (
        <div className="relative group" style={{ height: '75vh', width: '100%', background: '#fffdfa', borderRadius: '2rem', border: '2px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-warm)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.05}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#E69A59', // Primary Soft Amber
                        width: 25,
                        height: 25,
                    },
                    style: { strokeWidth: 4, stroke: '#E69A59', opacity: 1 }
                }}
            >
                <Background color="#E69A59" gap={30} size={1} opacity={0.05} />
                <Controls showInteractive={false} className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-lg" />
                <MiniMap 
                    nodeColor={(n) => {
                        if (n.type === 'input') return 'var(--primary)';
                        return 'var(--secondary)';
                    }}
                    maskColor="rgba(0,0,0,0.03)"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem' }}
                />
            </ReactFlow>
            
            {/* Control Bar */}
            <div className="absolute top-6 right-6 flex gap-3">
                <button 
                    onClick={onResetLayout}
                    className="flex items-center gap-2 bg-card border-2 border-border px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:text-primary hover:border-primary transition-all shadow-lg active:scale-95 group/btn"
                    title="Reset Layout"
                >
                    <RotateCcw size={18} className="group-hover/btn:-rotate-90 transition-transform duration-500" />
                    Reset
                </button>
                <button 
                    onClick={onDownload}
                    className="flex items-center gap-2 bg-primary border-2 border-primary px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-glow-primary active:scale-95 group/btn"
                >
                    <Download size={18} className="group-hover/btn:scale-110 transition-transform" />
                    Download PNG
                </button>
            </div>
        </div>
    );
};

export default MindMapComponent;
