import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../supabase';

interface ActivityLog {
  id: string;
  created_at: string;
  node_title: string;
  category_title: string;
  field_label: string;
  profiles: { username: string }[] | { username: string } | null;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '방금';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('id, created_at, node_title, category_title, field_label, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setLogs(data as ActivityLog[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('activity_logs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const username = (Array.isArray(log.profiles) ? log.profiles[0]?.username : log.profiles?.username) || '';
    return (
      log.node_title.toLowerCase().includes(term) ||
      (log.category_title || '').toLowerCase().includes(term) ||
      log.field_label.toLowerCase().includes(term) ||
      username.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-sm">
            <Activity size={20} className="text-blue-500" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-700">활동 로그</h2>
        </div>
        
        <div className="flex items-center gap-2 flex-1 md:max-w-xs">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="로그 검색 (담당자, 항목, 내용...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm md:shadow-none"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm md:shadow-lg border border-slate-200 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">로딩 중...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            {searchTerm ? '검색 결과가 없습니다' : '아직 활동 기록이 없습니다'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left p-3 md:p-4 font-bold text-slate-400 text-xs uppercase">시간</th>
                  <th className="text-left p-3 md:p-4 font-bold text-slate-400 text-xs uppercase">담당자</th>
                  <th className="text-left p-3 md:p-4 font-bold text-slate-400 text-xs uppercase">대분류</th>
                  <th className="text-left p-3 md:p-4 font-bold text-slate-400 text-xs uppercase">항목</th>
                  <th className="text-left p-3 md:p-4 font-bold text-slate-400 text-xs uppercase">수정 내용</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 md:p-4 text-slate-500 whitespace-nowrap">{relativeTime(log.created_at)}</td>
                    <td className="p-3 md:p-4 font-bold text-slate-700">{(Array.isArray(log.profiles) ? log.profiles[0]?.username : log.profiles?.username) || '알 수 없음'}</td>
                    <td className="p-3 md:p-4 text-slate-600">{log.category_title || '-'}</td>
                    <td className="p-3 md:p-4 text-slate-700 font-medium">{log.node_title}</td>
                    <td className="p-3 md:p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                        {log.field_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
