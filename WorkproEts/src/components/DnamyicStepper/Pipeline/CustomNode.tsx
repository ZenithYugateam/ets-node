import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useStore } from './store';

export const CustomNode = memo(({ data, id }: NodeProps) => {
  const { removeNode } = useStore();

  return (
    <div className="relative px-4 md:px-6 py-3 md:py-4 shadow-lg rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-xl min-w-[180px] md:min-w-[200px] max-w-[300px] md:max-w-[400px] group">
      {/* Delete button */}
      {id !== '1' && ( // Prevent deleting the first node
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors opacity-0 group-hover:opacity-100 z-50"
          title="Delete node"
        >
          <Trash2 size={14} />
        </button>
      )}
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 md:w-4 md:h-4 !bg-blue-500 hover:!bg-blue-600 -top-2 border-2 border-white" 
      />
      <div className="flex flex-col gap-1 md:gap-2">
        <div className="font-bold text-sm md:text-base text-gray-800 line-clamp-2">{data.label}</div>
        <div className="text-gray-600 text-xs md:text-sm line-clamp-3">{data.description}</div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 md:w-4 md:h-4 !bg-blue-500 hover:!bg-blue-600 -bottom-2 border-2 border-white" 
      />
    </div>
  );
});