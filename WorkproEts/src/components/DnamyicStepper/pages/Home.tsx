import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Layout } from '../Layout';
import { Pipeline } from '../Pipeline/Pipeline';
import { NodeEditor } from '../Pipeline/NodeEditor';
import { FlowPreview } from '../Pipeline/Preview/FlowPreview';
import { FlowSelector } from '../Pipeline/FlowSelector';
import { useStore } from '../Pipeline/store';
import { Eye } from 'lucide-react';

export function Home() {
  const { selectedNode, flows, currentFlowId, setSelectedNode } = useStore();
  const [showPreview, setShowPreview] = React.useState(false);

  const currentFlow = flows.find(f => f.id === currentFlowId);
  
  // Check if the flow is complete (has nodes and all required fields)
  const isFlowComplete = React.useMemo(() => {
    if (!currentFlow) return false;
    
    return currentFlow.nodes.length > 0 && currentFlow.nodes.every(node => {
      // Check if node has label and description
      if (!node.data.label || !node.data.description) return false;
      
      // If node has form questions, check if they're valid
      if (node.data.form?.questions) {
        return node.data.form.questions.every(question => 
          question.title && // Has title
          (!question.required || // Not required OR
            (question.type !== 'multipleChoice' && question.type !== 'checkbox' && question.type !== 'dropdown') || // Not a choice type OR
            (question.options && question.options.length >= 2 && question.options.every(opt => opt.trim() !== ''))) // Has valid options
        );
      }
      
      return true;
    });
  }, [currentFlow]);

  if (!currentFlow) return null;

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Flow Builder</h1>
        <button
          onClick={() => setShowPreview(true)}
          disabled={!isFlowComplete}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isFlowComplete
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={isFlowComplete ? 'Preview flow' : 'Complete all required fields to preview'}
        >
          <Eye size={20} />
          Preview Flow
        </button>
      </div>

      <FlowSelector />

      {/* Flow Steps Cards */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-4 pb-4 min-w-min">
          {currentFlow.nodes.map((node, index) => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`flex-shrink-0 w-[280px] bg-white rounded-xl shadow-lg border-2 transition-all cursor-pointer
                ${selectedNode?.id === node.id ? 'border-blue-500 shadow-blue-100' : 'border-gray-200 hover:border-blue-300'}
              `}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{node.data.label}</h3>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {node.data.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {node.data.form?.questions?.length || 0} Questions
                  </span>
                </div>
              </div>

              {node.data.form?.questions?.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 rounded-b-xl">
                  <div className="text-xs text-gray-500">
                    Question Types:
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.from(new Set(node.data.form.questions.map(q => q.type))).map(type => (
                        <span
                          key={type}
                          className="px-2 py-0.5 bg-white rounded-full border border-gray-200 text-gray-600"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Flow Editor */}
      <div className={`relative h-full transition-all duration-300 ${selectedNode ? 'mr-0 md:mr-[600px]' : ''}`}>
        <ReactFlowProvider>
          <Pipeline />
          <NodeEditor />
          {showPreview && <FlowPreview onClose={() => setShowPreview(false)} />}
        </ReactFlowProvider>
      </div>
    </Layout>
  );
}