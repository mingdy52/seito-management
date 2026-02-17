import React from 'react';
import { Plus, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { TreeNode as TreeNodeType } from '../types';
import { getLevelInfo, ADD_CHILD_LABELS } from '../constants';

interface TreeNodeProps {
  node: TreeNodeType;
  selectedNodeId: string;
  draggedNodeId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAdd: (parentId: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node, selectedNodeId, draggedNodeId,
  onSelect, onToggle, onAdd, onDragStart, onDragOver, onDrop,
}) => {
  const info = getLevelInfo(node.level);
  const NodeIcon = info.Icon;

  return (
    <div className={`${node.level === 0 ? 'ml-0 mt-2' : 'ml-3'} border-l border-slate-100 pl-1.5 py-0.5`}>
      <div
        draggable={node.level >= 0}
        onDragStart={(e) => onDragStart(e, node.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, node.id)}
        className={`group flex items-center gap-1 p-1 rounded-md cursor-pointer transition-all ${
          selectedNodeId === node.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
        } ${draggedNodeId === node.id ? 'opacity-30' : 'opacity-100'}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        {node.level >= 0 && <GripVertical size={12} className="text-slate-200 group-hover:text-slate-400 shrink-0" />}
        {node.children && node.children.length > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); onToggle(node.id); }} className="shrink-0 text-slate-400">
            {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <div className="w-3.5 shrink-0" />}
        {node.level >= 0 && <NodeIcon size={14} className={`${info.color} shrink-0`} />}
        <span className={`font-medium truncate ${node.level === 0 ? 'text-base text-slate-800' : 'text-slate-600 text-[12px]'}`}>
          {String(node.title || '')}
        </span>
        {node.level < 5 && (
          <button title={ADD_CHILD_LABELS[node.level] || '항목 추가'} className="ml-auto p-1 hover:text-blue-600 opacity-0 group-hover:opacity-100 font-bold" onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}>
            <Plus size={12} />
          </button>
        )}
      </div>
      {node.isOpen && node.children && node.children.map(child => (
        <TreeNodeComponent
          key={child.id}
          node={child}
          selectedNodeId={selectedNodeId}
          draggedNodeId={draggedNodeId}
          onSelect={onSelect}
          onToggle={onToggle}
          onAdd={onAdd}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};
