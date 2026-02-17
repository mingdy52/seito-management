import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, FileDown, GripHorizontal, LogOut } from 'lucide-react';
import { TreeNode } from './types';
import { DEFAULT_NODE_TITLES, FIELD_LABELS } from './constants';
import { findNode, findParent, findAncestorAtLevel } from './utils/treeUtils';
import { compressImage } from './utils/imageUtils';
import { useAuth } from './hooks/useAuth';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useResizable } from './hooks/useResizable';
import { supabase } from './supabase';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { NodeEditor } from './components/NodeEditor';
import { Dashboard } from './components/Dashboard';
import { ExportModal } from './components/ExportModal';

const INITIAL_DATA: TreeNode = {
  id: 'system_root',
  level: -1,
  children: [
    { id: 'root', title: '세이토', level: 0, isOpen: true, children: [
      { id: '1', title: '담당자 성함', level: 1, isOpen: false, children: [] },
    ]},
  ],
};

const App = () => {
  const { user, loading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const { data: syncData, setData: setSyncData, saveStatus } = useSupabaseSync(guestMode ? null : user);
  const [localData, setLocalData] = useState<TreeNode | null>(INITIAL_DATA);

  const data = guestMode ? (localData ?? INITIAL_DATA) : syncData;
  const setData = guestMode ? setLocalData : setSyncData;
  const { leftWidth, startResizing } = useResizable(30);

  const [selectedNodeId, setSelectedNodeId] = useState('root');
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'dashboard'>('editor');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateNode = (id: string, fields: Partial<TreeNode>) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const node = findNode(newData, id);
      if (node) Object.assign(node, fields);
      return newData;
    });
  };

  const addNode = (parentId: string) => {
    const newNodeId = Date.now().toString();
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const parent = findNode(newData, parentId);
      if (parent) {
        const nextLevel = parent.level + 1;
        const newNode: TreeNode = {
          id: newNodeId,
          title: DEFAULT_NODE_TITLES[nextLevel] || '새 세부과정',
          level: nextLevel,
          children: [],
          isOpen: true,
          definition: '',
          supplies: '',
          detail: '',
          tip: '',
          time: '',
          image: '',
        };
        parent.children = parent.children || [];
        parent.children.push(newNode);
        parent.isOpen = true;
      }
      return newData;
    });
    setSelectedNodeId(newNodeId);
  };

  const deleteNode = (id: string) => {
    if (id === 'system_root') return;
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const removeRecursive = (p: TreeNode) => {
        if (!p.children) return;
        p.children = p.children.filter(child => child.id !== id);
        p.children.forEach(removeRecursive);
      };
      removeRecursive(newData);
      return newData;
    });
    setSelectedNodeId('system_root');
  };

  const toggleNode = (id: string) => {
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const node = findNode(newData, id);
      if (node) node.isOpen = !node.isOpen;
      return newData;
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedNodeId(id);
    e.dataTransfer.setData('nodeId', id);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('nodeId');
    if (draggedId === targetId) return;
    setData(prev => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const dParent = findParent(newData, draggedId);
      const tParent = findParent(newData, targetId);
      if (dParent && tParent && dParent.id === tParent.id) {
        const children = [...dParent.children!];
        const dIdx = children.findIndex(c => c.id === draggedId);
        const tIdx = children.findIndex(c => c.id === targetId);
        const [removed] = children.splice(dIdx, 1);
        children.splice(tIdx, 0, removed);
        dParent.children = children;
      }
      return newData;
    });
    setDraggedNodeId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, nodeId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file).then(compressedBase64 => {
      updateNode(nodeId, { image: compressedBase64 });
      logActivity(nodeId, 'image');
    });
  };

  const logActivity = useCallback(async (nodeId: string, field: string) => {
    if (!user || guestMode || !data) return;
    const node = findNode(data, nodeId);
    if (!node) return;
    const nodeTitle = node.title || '이름 없음';
    const ancestor = findAncestorAtLevel(data, nodeId, 2);
    const categoryTitle = ancestor?.title || '';
    const fieldLabel = FIELD_LABELS[field] || field;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Check for recent log by same user, same node, same field within 5 minutes
    const { data: existing } = await supabase
      .from('activity_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('node_id', nodeId)
      .eq('field_label', fieldLabel)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('activity_logs')
        .update({ created_at: new Date().toISOString(), node_title: nodeTitle, category_title: categoryTitle })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        node_id: nodeId,
        node_title: nodeTitle,
        category_title: categoryTitle,
        field_label: fieldLabel,
      });
    }
  }, [user, guestMode, data]);

  const handleFieldBlur = useCallback((nodeId: string, field: string) => {
    logActivity(nodeId, field);
  }, [logActivity]);

  const handleSelect = (id: string) => {
    setSelectedNodeId(id);
    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
  };

  if (loading) return <LoadingScreen />;
  if (!user && !guestMode) return <AuthScreen onGuestMode={() => setGuestMode(true)} />;
  if (!data) return <LoadingScreen />;

  const selectedNode = findNode(data, selectedNodeId);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* 모바일 상단 헤더 */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Layout className="text-blue-600" size={20} /> 세이토
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsExportModalOpen(true)} className="p-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-slate-600">
            <FileDown size={20} />
          </button>
          <button onClick={() => guestMode ? setGuestMode(false) : supabase.auth.signOut()} className="p-2 bg-slate-100 hover:bg-red-500 hover:text-white rounded-lg transition-all text-slate-600">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 모바일 사이드바 배경 오버레이 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* 좌측 사이드바 */}
      <Sidebar
        data={data}
        selectedNodeId={selectedNodeId}
        draggedNodeId={draggedNodeId}
        saveStatus={saveStatus}
        leftWidth={leftWidth}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSelect={handleSelect}
        onToggle={toggleNode}
        onAdd={addNode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onExportOpen={() => setIsExportModalOpen(true)}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        onSignOut={() => guestMode ? setGuestMode(false) : supabase.auth.signOut()}
      />

      {/* 데스크탑 리사이저 */}
      <div onMouseDown={startResizing} className="hidden md:block w-1.5 h-full cursor-col-resize hover:bg-blue-400 bg-transparent transition-colors z-30 group relative shrink-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none">
          <GripHorizontal size={12} className="text-blue-600 rotate-90" />
        </div>
      </div>

      {/* 우측 메인 콘텐츠 */}
      <div style={{ width: isMobile ? '100%' : `${100 - leftWidth}%` }} className="flex-1 p-4 md:p-8 bg-slate-50 overflow-auto z-10 w-full">
        {activeTab === 'dashboard' ? (
          <Dashboard />
        ) : selectedNode && selectedNode.level >= 0 ? (
          <NodeEditor
            data={data}
            selectedNode={selectedNode}
            isMobile={isMobile}
            onUpdate={updateNode}
            onDelete={deleteNode}
            onAdd={addNode}
            onSelect={handleSelect}
            onImageUpload={handleImageUpload}
            onFieldBlur={handleFieldBlur}
            onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          />
        ) : (
          <NodeEditor
            data={data}
            selectedNode={{ id: 'none', level: -1 }}
            isMobile={isMobile}
            onUpdate={updateNode}
            onDelete={deleteNode}
            onAdd={addNode}
            onSelect={handleSelect}
            onImageUpload={handleImageUpload}
            onFieldBlur={handleFieldBlur}
            onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
          />
        )}
      </div>

      {/* 내보내기 모달 */}
      {isExportModalOpen && (
        <ExportModal
          data={data}
          onClose={() => setIsExportModalOpen(false)}
          onDataImport={(importedData) => setData(importedData)}
        />
      )}
    </div>
  );
};

export default App;
