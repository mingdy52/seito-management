import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TreeNode } from '../types';

interface NodeMapVisualizationProps {
  parentNode: TreeNode;
  centerBgClass: string;
  centerIconClass: string;
  CenterIcon: LucideIcon;
  centerFallbackTitle: string;
  childBorderClass: string;
  childHoverBorderClass: string;
  childBgClass: string;
  childHoverBgClass: string;
  ChildIcon: LucideIcon;
  childIconClass: string;
  childFallbackTitle: string;
  emptyMessage: string;
  onSelectChild: (id: string) => void;
}

export const NodeMapVisualization: React.FC<NodeMapVisualizationProps> = ({
  parentNode, centerBgClass, centerIconClass, CenterIcon, centerFallbackTitle,
  childBorderClass, childHoverBorderClass, childBgClass, childHoverBgClass,
  ChildIcon, childIconClass, childFallbackTitle, emptyMessage, onSelectChild,
}) => {
  const children = parentNode.children || [];

  if (children.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-slate-400 font-bold text-sm max-w-md mx-auto">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[320px] md:h-[450px] bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {children.map((child, index) => {
          const total = children.length;
          const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
          const rx = 35;
          const ry = 35;
          const x = 50 + Math.cos(angle) * rx;
          const y = 50 + Math.sin(angle) * ry;
          return (
            <line key={`line-${child.id}`} x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
          );
        })}
      </svg>

      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-6 md:px-8 py-3 md:py-4 ${centerBgClass} text-white font-bold rounded-full shadow-lg border-4 border-white flex items-center gap-2 whitespace-nowrap`}>
        <CenterIcon size={18} className={centerIconClass} />
        {parentNode.title || centerFallbackTitle}
      </div>

      {children.map((child, index) => {
        const total = children.length;
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        const rx = 35;
        const ry = 35;
        const x = 50 + Math.cos(angle) * rx;
        const y = 50 + Math.sin(angle) * ry;

        return (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-24 md:w-32 p-3 md:p-4 bg-white border-2 ${childBorderClass} rounded-3xl ${childHoverBorderClass} hover:shadow-xl hover:scale-110 transition-all text-center group shadow-sm`}
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 ${childBgClass} rounded-full flex items-center justify-center ${childHoverBgClass} transition-all`}>
              <ChildIcon size={16} className={childIconClass} />
            </div>
            <span className="font-bold text-slate-700 text-[11px] md:text-xs block truncate w-full">{child.title || childFallbackTitle}</span>
          </button>
        );
      })}
    </div>
  );
};
