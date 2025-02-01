import { Node, Edge } from 'reactflow';

export type QuestionType = 'shortAnswer' | 'paragraph' | 'multipleChoice' | 'checkbox' | 'dropdown' | 'location' | 'image' | 'date' | 'time' | 'phone' | 'email' | 'url';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    acceptedFileTypes?: string[];
    maxFileSize?: number;
  };
  placeholder?: string;
}

export interface FormData {
  questions: Question[];
}

export interface NodeData {
  label: string;
  description: string;
  form?: FormData;
}

export interface Flow {
  id: string;
  name: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export type PipelineNode = Node<NodeData>;
export type PipelineEdge = Edge;

export interface PipelineState {
  flows: Flow[];
  currentFlowId: string | null;
  selectedNode: PipelineNode | null;
  setFlows: (flows: Flow[]) => void;
  setCurrentFlowId: (id: string | null) => void;
  addFlow: (name: string) => void;
  updateFlowName: (id: string, name: string) => void;
  deleteFlow: (id: string) => void;
  setNodes: (nodes: PipelineNode[]) => void;
  setEdges: (edges: PipelineEdge[]) => void;
  addNode: (node: PipelineNode) => void;
  updateNode: (id: string, data: NodeData) => void;
  removeNode: (id: string) => void;
  setSelectedNode: (node: PipelineNode | null) => void;
  addEdge: (edge: PipelineEdge) => void;
  removeEdge: (id: string) => void;
}