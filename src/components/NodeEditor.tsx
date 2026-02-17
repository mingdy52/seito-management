import React from 'react';
import { Plus, Trash2, BookOpen, FolderTree, Layout, User, Activity } from 'lucide-react';
import { TreeNode } from '../types';
import { getLevelInfo, ADD_CHILD_LABELS } from '../constants';
import { findNode } from '../utils/treeUtils';
import { getAllNodesList } from '../utils/treeUtils';
import { NodeMapVisualization } from './NodeMapVisualization';
import { ProcessEditor } from './ProcessEditor';

interface NodeEditorProps {
  data: TreeNode;
  selectedNode: TreeNode;
  isMobile: boolean;
  onUpdate: (id: string, fields: Partial<TreeNode>) => void;
  onDelete: (id: string) => void;
  onAdd: (parentId: string) => void;
  onSelect: (id: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, nodeId: string) => void;
  onFieldBlur: (nodeId: string, field: string) => void;
  onMobileMenuOpen: () => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({
  data, selectedNode, isMobile,
  onUpdate, onDelete, onAdd, onSelect, onImageUpload, onFieldBlur, onMobileMenuOpen,
}) => {
  if (selectedNode.level < 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4 pb-20 md:pb-0">
        <BookOpen size={isMobile ? 60 : 80} className="opacity-10" />
        <p className="font-bold text-slate-400 text-lg md:text-xl tracking-tight">항목을 선택해 주세요</p>
        {isMobile && (
          <button onClick={onMobileMenuOpen} className="mt-4 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center gap-2">
            <FolderTree size={18} /> 목차 열기
          </button>
        )}
      </div>
    );
  }

  const selectedInfo = getLevelInfo(selectedNode.level);
  const SelectedIcon = selectedInfo.Icon;
  const allNodes = getAllNodesList(data);

  const MAP_CONFIG: Record<number, {
    centerBgClass: string; centerIconClass: string; CenterIcon: typeof Layout;
    centerFallbackTitle: string; childBorderClass: string; childHoverBorderClass: string;
    childBgClass: string; childHoverBgClass: string; ChildIcon: typeof Layout;
    childIconClass: string; childFallbackTitle: string; emptyMessage: string;
  }> = {
    0: {
      centerBgClass: 'bg-indigo-600', centerIconClass: 'text-indigo-100', CenterIcon: Layout,
      centerFallbackTitle: '프로젝트', childBorderClass: 'border-blue-100',
      childHoverBorderClass: 'hover:border-blue-400', childBgClass: 'bg-blue-50',
      childHoverBgClass: 'group-hover:bg-blue-100', ChildIcon: User,
      childIconClass: 'text-blue-500', childFallbackTitle: '새 담당자',
      emptyMessage: '등록된 담당자가 없어. 항목 추가 버튼을 눌러 프로젝트를 구성해 봐!',
    },
    1: {
      centerBgClass: 'bg-slate-800', centerIconClass: 'text-blue-400', CenterIcon: User,
      centerFallbackTitle: '담당자', childBorderClass: 'border-emerald-100',
      childHoverBorderClass: 'hover:border-emerald-400', childBgClass: 'bg-emerald-50',
      childHoverBgClass: 'group-hover:bg-emerald-100', ChildIcon: FolderTree,
      childIconClass: 'text-emerald-500', childFallbackTitle: '새 대분류',
      emptyMessage: '등록된 대분류가 없어. 항목 추가 버튼을 눌러 구름을 만들어 봐!',
    },
    2: {
      centerBgClass: 'bg-emerald-600', centerIconClass: 'text-emerald-100', CenterIcon: FolderTree,
      centerFallbackTitle: '대분류', childBorderClass: 'border-orange-100',
      childHoverBorderClass: 'hover:border-orange-400', childBgClass: 'bg-orange-50',
      childHoverBgClass: 'group-hover:bg-orange-100', ChildIcon: Activity,
      childIconClass: 'text-orange-500', childFallbackTitle: '새 진행과정',
      emptyMessage: '등록된 진행과정이 없어. 항목 추가 버튼을 눌러 구름을 만들어 봐!',
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 pb-20 md:pb-0">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/90 backdrop-blur py-2 z-10 md:static md:bg-transparent md:backdrop-blur-none md:py-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-sm"><SelectedIcon size={isMobile ? 18 : 20} className={selectedInfo.color} /></div>
          <h2 className="text-base md:text-lg font-bold text-slate-700">{selectedInfo.label}</h2>
        </div>
        <button onClick={() => onDelete(selectedNode.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-white rounded-lg transition-colors"><Trash2 size={20} /></button>
      </div>

      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm md:shadow-lg border border-slate-200 space-y-6 md:space-y-8 relative">
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-slate-400 mb-2 md:mb-3 uppercase">{selectedInfo.titleLabel}</label>
          <input className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-lg md:text-xl font-bold transition-all" value={selectedNode.title || ''} onChange={(e) => onUpdate(selectedNode.id, { title: e.target.value })} onBlur={() => onFieldBlur(selectedNode.id, 'title')} />
        </div>

        {selectedNode.level <= 2 && MAP_CONFIG[selectedNode.level] && (
          <div className="pt-8 mt-4 border-t border-slate-100 animate-in fade-in duration-300 pb-8">
            <NodeMapVisualization
              parentNode={selectedNode}
              onSelectChild={onSelect}
              {...MAP_CONFIG[selectedNode.level]}
            />
          </div>
        )}

        {selectedNode.level >= 3 && (
          <ProcessEditor
            node={selectedNode}
            allNodes={allNodes}
            onUpdate={onUpdate}
            onImageUpload={onImageUpload}
            onFieldBlur={onFieldBlur}
            onSelectNode={onSelect}
            findNodeById={(id) => findNode(data, id)}
          />
        )}
      </div>

      {selectedNode.level < 5 && (
        <button onClick={() => onAdd(selectedNode.id)} className="w-full flex items-center justify-center gap-2 md:gap-3 bg-slate-900 text-white p-4 md:p-5 rounded-2xl md:rounded-3xl font-bold hover:bg-slate-800 text-base md:text-lg shadow-lg transition-all active:scale-[0.98]"><Plus size={20} className="md:w-6 md:h-6" /> {ADD_CHILD_LABELS[selectedNode.level] || '항목 추가'}</button>
      )}
    </div>
  );
};
