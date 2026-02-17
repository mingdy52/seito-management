import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { TreeNode, SaveStatus } from '../types';
import { setOpenByLevel } from '../utils/treeUtils';

const INITIAL_DATA: TreeNode = {
  id: 'system_root',
  level: -1,
  children: [],
};

export function useSupabaseSync(user: User | null) {
  const [data, setData] = useState<TreeNode | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const localUpdateCount = useRef(0);
  const rowMap = useRef(new Map<string, string>()); // node_id → row UUID
  const isInitialLoad = useRef(true);

  // 초기 데이터 로드
  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }

    const loadData = async () => {
      const { data: rows, error } = await supabase
        .from('manual_trees')
        .select('id, node_id, tree')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase read error:', error);
        return;
      }

      rowMap.current = new Map();

      if (rows && rows.length > 0) {
        const children: TreeNode[] = rows.map(row => {
          rowMap.current.set(row.node_id, row.id);
          const tree = row.tree as TreeNode;
          setOpenByLevel(tree, 0);
          return tree;
        });

        isInitialLoad.current = true;
        setData({ id: 'system_root', level: -1, children });
      } else {
        isInitialLoad.current = true;
        setData(INITIAL_DATA);
      }
    };

    loadData();
  }, [user]);

  // 실시간 구독
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('manual_trees_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'manual_trees' },
        (payload) => {
          if (localUpdateCount.current > 0) {
            localUpdateCount.current--;
            return;
          }

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const rec = payload.new as { id: string; node_id: string; tree: TreeNode };
            rowMap.current.set(rec.node_id, rec.id);

            setData(prev => {
              if (!prev) return prev;
              const newData = JSON.parse(JSON.stringify(prev));
              const idx = (newData.children || []).findIndex((c: TreeNode) => c.id === rec.node_id);
              if (idx >= 0) {
                newData.children[idx] = rec.tree;
              } else {
                newData.children = [...(newData.children || []), rec.tree];
              }
              return newData;
            });
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id: string }).id;
            let deletedNodeId: string | null = null;
            for (const [nodeId, rowId] of rowMap.current) {
              if (rowId === oldId) {
                deletedNodeId = nodeId;
                break;
              }
            }
            if (deletedNodeId) {
              rowMap.current.delete(deletedNodeId);
              setData(prev => {
                if (!prev) return prev;
                const newData = JSON.parse(JSON.stringify(prev));
                newData.children = (newData.children || []).filter((c: TreeNode) => c.id !== deletedNodeId);
                return newData;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 자동 저장 (1.5초 디바운스) — Lv.0 트리별 개별 저장
  useEffect(() => {
    if (!user || !data) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const currentChildren = data.children || [];
        const currentNodeIds = new Set(currentChildren.map(c => c.id));

        // 각 Lv.0 트리 upsert
        for (const child of currentChildren) {
          const existingRowId = rowMap.current.get(child.id);
          localUpdateCount.current++;

          if (existingRowId) {
            const { error } = await supabase
              .from('manual_trees')
              .update({ tree: child as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
              .eq('id', existingRowId);
            if (error) throw error;
          } else {
            const { data: inserted, error } = await supabase
              .from('manual_trees')
              .insert({ node_id: child.id, tree: child as unknown as Record<string, unknown> })
              .select('id')
              .single();
            if (error) throw error;
            if (inserted) rowMap.current.set(child.id, inserted.id);
          }
        }

        // 삭제된 트리 제거
        for (const [nodeId, rowId] of rowMap.current) {
          if (!currentNodeIds.has(nodeId)) {
            localUpdateCount.current++;
            await supabase.from('manual_trees').delete().eq('id', rowId);
            rowMap.current.delete(nodeId);
          }
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Supabase save error:', err);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [data, user]);

  return { data, setData, saveStatus };
}
