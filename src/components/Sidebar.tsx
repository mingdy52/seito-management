import React from 'react';
import { Plus, Layout, FolderTree, FileDown, X, CloudUpload, Check, Cloud, Activity, Pencil, LogOut } from 'lucide-react';
import { TreeNode } from '../types';
import { SaveStatus } from '../types';
import { TreeNodeComponent } from './TreeNode';

interface SidebarProps {
  data: TreeNode;
  selectedNodeId: string;
  draggedNodeId: string | null;
  saveStatus: SaveStatus;
  leftWidth: number;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAdd: (parentId: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  activeTab: 'editor' | 'dashboard';
  onTabChange: (tab: 'editor' | 'dashboard') => void;
  onExportOpen: () => void;
  onMobileMenuClose: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  data, selectedNodeId, draggedNodeId, saveStatus, leftWidth,
  isMobile, isMobileMenuOpen, activeTab, onTabChange,
  onSelect, onToggle, onAdd, onDragStart, onDragOver, onDrop,
  onExportOpen, onMobileMenuClose, onSignOut,
}) => {
  const treeProps = { selectedNodeId, draggedNodeId, onSelect, onToggle, onAdd, onDragStart, onDragOver, onDrop };

  return (
    <div
      style={{ width: isMobile ? '80%' : `${leftWidth}%` }}
      className={`fixed md:relative inset-y-0 left-0 max-w-[320px] md:max-w-none min-w-[260px] md:min-w-[180px] p-3 overflow-hidden border-r border-slate-200 bg-white shadow-2xl md:shadow-sm flex flex-col z-50 md:z-20 h-full transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex flex-col gap-3 mb-6 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold flex items-center gap-1.5 text-slate-800 hidden md:flex">
            <Layout className="text-blue-600" size={18} /> 세이토 빌더
          </h1>
          <div className="md:hidden flex items-center gap-2 font-bold text-slate-800">
            <FolderTree className="text-blue-600" size={18} /> 목차
          </div>
          <button onClick={onMobileMenuClose} className="md:hidden p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600">
            <X size={16} />
          </button>
          <button onClick={onExportOpen} className="hidden md:block p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-slate-600">
            <FileDown size={16} />
          </button>
        </div>
      </div>

      <div className="select-none flex-1 -ml-2 overflow-y-auto pr-2 pb-4">
        {data.level === -1 ? (
          data.children!.map(child => <TreeNodeComponent key={child.id} node={child} {...treeProps} />)
        ) : (
          <TreeNodeComponent node={data} {...treeProps} />
        )}
        <div className="mt-4 px-3">
          <button
            onClick={() => onAdd('system_root')}
            className="w-full flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 border-dashed rounded-xl text-slate-500 font-bold transition-all text-sm group"
          >
            <Plus size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            프로젝트 추가
          </button>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-100 shrink-0">
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => onTabChange('editor')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Pencil size={13} /> 편집
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Activity size={13} /> 활동 로그
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
        <span className="text-xs font-bold text-slate-400">상태</span>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' ? (
            <span className="text-[10px] text-blue-500 font-bold animate-pulse"><CloudUpload size={12} className="inline mr-1"/> 저장중</span>
          ) : saveStatus === 'saved' ? (
            <span className="text-[10px] text-emerald-500 font-bold"><Check size={12} className="inline mr-1"/> 동기화됨</span>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold"><Cloud size={12} className="inline mr-1"/> 대기중</span>
          )}
          <button onClick={onSignOut} className="hidden md:block p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-all text-slate-400">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
