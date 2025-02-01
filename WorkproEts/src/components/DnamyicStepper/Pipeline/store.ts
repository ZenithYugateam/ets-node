import { create } from 'zustand';
import { PipelineState, PipelineNode, PipelineEdge, Flow } from './types';

const initialNode: PipelineNode = {
  id: '1',
  type: 'custom',
  position: { x: 250, y: 50 },
  data: { label: 'Input', description: 'Start of pipeline' },
};

const initialFlow: Flow = {
  id: '1',
  name: 'Default Flow',
  nodes: [initialNode],
  edges: [],
};

export const useStore = create<PipelineState>((set, get) => ({
  flows: [initialFlow],
  currentFlowId: '1',
  selectedNode: null,

  setFlows: (flows) => set({ flows }),
  setCurrentFlowId: (id) => set({ currentFlowId: id, selectedNode: null }),

  addFlow: (name) => {
    const newFlow: Flow = {
      id: Date.now().toString(),
      name,
      nodes: [{ ...initialNode }],
      edges: [],
    };
    set((state) => ({
      flows: [...state.flows, newFlow],
      currentFlowId: newFlow.id,
      selectedNode: null,
    }));
  },

  updateFlowName: (id, name) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === id ? { ...flow, name } : flow
      ),
    })),

  deleteFlow: (id) =>
    set((state) => {
      const newFlows = state.flows.filter((flow) => flow.id !== id);
      return {
        flows: newFlows,
        currentFlowId: newFlows.length > 0 ? newFlows[0].id : null,
        selectedNode: null,
      };
    }),

  setNodes: (nodes) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === state.currentFlowId ? { ...flow, nodes } : flow
      ),
    })),

  setEdges: (edges) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === state.currentFlowId ? { ...flow, edges } : flow
      ),
    })),

  addNode: (node) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === state.currentFlowId
          ? { ...flow, nodes: [...flow.nodes, node] }
          : flow
      ),
    })),

  updateNode: (id, data) =>
    set((state) => {
      const currentFlow = state.flows.find((f) => f.id === state.currentFlowId);
      if (!currentFlow) return state;

      const updatedNodes = currentFlow.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      );

      return {
        flows: state.flows.map((flow) =>
          flow.id === state.currentFlowId
            ? { ...flow, nodes: updatedNodes }
            : flow
        ),
        selectedNode:
          state.selectedNode?.id === id
            ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data } }
            : state.selectedNode,
      };
    }),

  removeNode: (id) =>
    set((state) => {
      const currentFlow = state.flows.find((f) => f.id === state.currentFlowId);
      if (!currentFlow) return state;

      const nodeIndex = currentFlow.nodes.findIndex((node) => node.id === id);
      const newNodes = currentFlow.nodes.filter((node) => node.id !== id);
      const newEdges = currentFlow.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );

      if (nodeIndex > 0 && nodeIndex < currentFlow.nodes.length - 1) {
        const prevNode = currentFlow.nodes[nodeIndex - 1];
        const afterNode = currentFlow.nodes[nodeIndex + 1];
        newEdges.push({
          id: `e${prevNode.id}-${afterNode.id}`,
          source: prevNode.id,
          target: afterNode.id,
          animated: true,
        });
      }

      return {
        flows: state.flows.map((flow) =>
          flow.id === state.currentFlowId
            ? { ...flow, nodes: newNodes, edges: newEdges }
            : flow
        ),
        selectedNode: null,
      };
    }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  addEdge: (edge) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === state.currentFlowId
          ? { ...flow, edges: [...flow.edges, edge] }
          : flow
      ),
    })),

  removeEdge: (id) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === state.currentFlowId
          ? { ...flow, edges: flow.edges.filter((edge) => edge.id !== id) }
          : flow
      ),
    })),
}));