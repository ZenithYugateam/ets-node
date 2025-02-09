import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlusCircle, Trash2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { CustomNode } from './CustomNode';
import { useStore } from './store';
import { PipelineNode, PipelineEdge } from './types';

const nodeTypes = {
  custom: CustomNode,
};

export function Pipeline() {
  const {
    flows,
    currentFlowId,
    setNodes,
    setEdges,
    addNode,
    addEdge,
    removeEdge,
    setSelectedNode,
    selectedNode,
  } = useStore();

  // Get the current flow
  const currentFlow = flows.find(f => f.id === currentFlowId);

  // Debugging logs to check if the flow and nodes exist
  console.log("Current Flow:", currentFlow);
  console.log("Nodes in Current Flow:", currentFlow?.nodes);
  console.log("Edges in Current Flow:", currentFlow?.edges);

  if (!currentFlow) {
    console.warn("No current flow found!");
    return <div className="p-4 text-red-500">No flow available</div>;
  }

  // Ensure nodes and edges are always defined
  const nodes = currentFlow.nodes || [];
  const edges = currentFlow.edges || [];

  const { project, zoomIn, zoomOut } = useReactFlow();

  // Handle node position changes
  const onNodesChange = useCallback(
    (changes: any[]) => {
      setNodes(
        changes.reduce((acc: any[], change: { type: string; dragging: any; id: any; position: any; }) => {
          if (change.type === 'position' && change.dragging) {
            return acc.map((node: { id: any; }) =>
              node.id === change.id
                ? { ...node, position: change.position }
                : node
            );
          }
          return acc;
        }, nodes)
      );
    },
    [nodes, setNodes]
  );

  // Handle edge changes (removal)
  const onEdgesChange = useCallback(
    (changes: any[]) => {
      setEdges(
        changes.reduce((acc: any[], change: { type: string; id: any; }) => {
          if (change.type === 'remove') {
            return acc.filter((edge: { id: any; }) => edge.id !== change.id);
          }
          return acc;
        }, edges)
      );
    },
    [edges, setEdges]
  );

  // Handle connecting nodes with edges
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const edge: PipelineEdge = {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        animated: true,
      };
      addEdge(edge);
    },
    [addEdge]
  );

  // Handle edge clicks (deletion)
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      removeEdge(edge.id);
    },
    [removeEdge]
  );

  // Add a new node dynamically
  const addNewNode = useCallback(() => {
    if (!currentFlow) return;
  
    const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null; // Ensure lastNode is valid
    const ySpacing = 150;
  
    const newNode: PipelineNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: project({
        x: 250,
        y: lastNode ? lastNode.position.y + ySpacing : 100, // Fallback to y=100 if no lastNode
      }),
      data: { label: 'New Step', description: 'Add description here' },
    };
  
    addNode(newNode);
  
    if (lastNode) {
      const newEdge: PipelineEdge = {
        id: `e${lastNode.id}-${newNode.id}`,
        source: lastNode.id,
        target: newNode.id,
        animated: true,
      };
      addEdge(newEdge);
    }
  }, [currentFlow, nodes, project, addNode, addEdge])

  return (
    <div className={`h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-300 ${
      selectedNode ? 'md:mr-[600px]' : ''
    }`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node)}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        minZoom={0.2}
        maxZoom={2}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background gap={16} />
        <Controls className="hidden md:flex" />
        <MiniMap 
          nodeColor="#3b82f6"
          maskColor="rgb(255, 255, 255, 0.8)"
          className="hidden md:block rounded-lg"
        />

        {/* Mobile Controls */}
        <Panel position="top-left" className="md:hidden">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => zoomIn()}
                className="p-2 hover:bg-gray-50 rounded"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-2 hover:bg-gray-50 rounded"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </Panel>

        {/* Touch Instructions */}
        <Panel position="bottom-center" className="md:hidden">
          <div className="bg-white/90 backdrop-blur-sm rounded-t-lg shadow-lg border border-gray-200 p-2 text-xs text-gray-600 flex items-center gap-2">
            <Move size={14} />
            Drag to move • Pinch to zoom
          </div>
        </Panel>

        {/* Desktop Instructions */}
        <div className="absolute left-4 bottom-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 hidden md:block">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Trash2 size={16} className="text-blue-500" />
            Click any connection to remove it
          </div>
        </div>
      </ReactFlow>
      
      {/* Add Node Button */}
      <button
        onClick={addNewNode}
        className="fixed md:absolute bottom-6 right-6 bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all hover:scale-105 z-10"
        title="Add new node"
      >
        <PlusCircle size={24} />
      </button>
    </div>
  );
}
